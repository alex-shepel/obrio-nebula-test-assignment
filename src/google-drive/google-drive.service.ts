import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { drive, drive_v3 } from 'googleapis/build/src/apis/drive';
import { GoogleAuthService } from 'src/google-auth/google-auth.service';
import { Readable } from 'stream';
import { DriveFileListResult } from 'src/google-drive/google-drive.types';

@Injectable()
export class GoogleDriveService {
  private static readonly WORKING_DIRECTORY_NAME = 'obrio-nebula-test-assignment';

  private drive: drive_v3.Drive;
  private workingDirectoryId: string;
  private uploadedBytes: number = 0;

  constructor(private readonly authService: GoogleAuthService) {
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

  async listFiles(): Promise<DriveFileListResult[]> {
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

    return data.files.map(file => ({
      fileUrl: file.webViewLink ?? null,
      fileName: file.name ?? null,
      fileId: file.id ?? null,
    }));
  }

  private async getWorkingFolderId(): Promise<string | null> {
    const { data } = await this.drive.files.list({
      q: `name='${GoogleDriveService.WORKING_DIRECTORY_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });

    return data.files?.[0].id ?? null;
  }

  async streamFileToDrive(fileStream: Readable, fileName: string, fileSize: number): Promise<string> {
    const { data } = await this.drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/octet-stream',
        parents: [this.workingDirectoryId],
      },
      media: {
        mimeType: 'application/octet-stream',
        body: fileStream,
      },
      fields: 'id',
    },
    {
      onUploadProgress: (evt) => {
        this.uploadedBytes = evt.bytesRead;
        console.log(`Uploaded ${this.uploadedBytes} of ${fileSize} bytes`);
      },
    });

    console.log('File uploaded:', data);

    if (!data.id) {
      throw new HttpException(
        `File ${fileName} can not be uploaded`,
        HttpStatus.BAD_REQUEST
      );
    }

    return data.id;
  }
}
