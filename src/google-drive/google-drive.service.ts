import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { drive, drive_v3 } from 'googleapis/build/src/apis/drive';
import { GoogleAuthService } from 'src/google-auth/google-auth.service';
import { PassThrough } from 'stream';
import {
  DriveFile,
  SaveDriveFileResult,
} from 'src/google-drive/google-drive.types';
import { FileFetchService } from 'src/file-fetch/file-fetch.service';

@Injectable()
export class GoogleDriveService {
  private static readonly WORKING_DIRECTORY_NAME = 'obrio-nebula-test-assignment';

  private drive: drive_v3.Drive;
  private workingDirectoryId: string;

  constructor(
    private readonly authService: GoogleAuthService,
    private readonly fileFetchService: FileFetchService,
  ) {
    this.init();
  }

  private async init() {
    await this.initDrive();
    await this.initWorkingFolder();
  }

  private async initDrive() {
    const authClient = await this.authService.getAuthClient();

    this.drive = drive({
      version: 'v3',
      auth: authClient,
    });

    await this.initWorkingFolder();
  }

  private async initWorkingFolder(): Promise<void> {
    const existingWorkingFolderId = await this.getWorkingFolderId();

    if (existingWorkingFolderId) {
      this.workingDirectoryId = existingWorkingFolderId;

      return;
    }

    const { data: createdFolder } = await this.drive.files.create({
      requestBody: {
        name: GoogleDriveService.WORKING_DIRECTORY_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    if (!createdFolder.id) {
      throw new HttpException(
        `Cannot create working directory: ${GoogleDriveService.WORKING_DIRECTORY_NAME}`,
        HttpStatus.CONFLICT
      );
    }

    this.workingDirectoryId = createdFolder.id;
  }

  async listFiles(): Promise<DriveFile[]> {
    const { data } = await this.drive.files.list({
      q: `'${this.workingDirectoryId}' in parents and trashed=false`,
      fields: 'files(mimeType,id,name,webViewLink)',
    });

    if (!data.files) {
      throw new HttpException(
        `Cannot list files for request: '${this.workingDirectoryId}' in parents and trashed=false`,
        HttpStatus.BAD_REQUEST
      );
    }

    return data.files;
  }

  async saveFilesToDrive(fileUrls: string[]): Promise<SaveDriveFileResult[]> {
    return Promise.all(
      fileUrls.map(async (fileUrl) => {
        try {
          const {
            fileStream,
            fileName,
            mimeType,
          } = await this.fileFetchService.fetchFileStream(fileUrl);

          const fileId = await this.uploadStreamToDrive(fileName, fileStream, mimeType);

          return { fileUrl, fileName, fileId };
        } catch (error) {
          return { fileUrl, error: error.message };
        }
      }),
    );
  }

  private async getWorkingFolderId(): Promise<string | null> {
    const { data } = await this.drive.files.list({
      q: `name='${GoogleDriveService.WORKING_DIRECTORY_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });

    return data.files?.[0].id ?? null;
  }

  private async uploadStreamToDrive(fileName: string, fileStream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const passThrough = new PassThrough();
    fileStream.pipe(passThrough);

    const { data } = await this.drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [this.workingDirectoryId],
      },
      media: {
        mimeType,
        body: passThrough,
      },
      fields: 'id',
    });

    if (!data.id) {
      throw new HttpException(
        `File ${fileName} can not be uploaded`,
        HttpStatus.BAD_REQUEST
      );
    }

    return data.id;
  }
}
