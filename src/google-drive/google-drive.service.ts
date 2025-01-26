import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleAuthService } from '../google-auth/google-auth.service';
import axios from 'axios';
import * as path from 'path';
import { PassThrough } from 'stream';

@Injectable()
export class GoogleDriveService {
  private static readonly WORKING_DIRECTORY_NAME = 'obrio-nebula-test-assignment';

  private drive;
  private workingDirectoryId: string;

  constructor(private readonly authService: GoogleAuthService) {
    this.init();
  }

  private async init() {
    await this.initDrive();
    await this.initWorkingFolder();
  }

  private async initDrive() {
    const authClient = await this.authService.getAuthClient();

    this.drive = google.drive({
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

    this.workingDirectoryId = createdFolder.id;
  }

  async listFiles(): Promise<any> {
    try {
      const response = await this.drive.files.list({
        q: `'${this.workingDirectoryId}' in parents and trashed=false`,
        fields: 'files(mimeType,id,name,webViewLink)',
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing files from Google Drive:', error.message);
      throw new Error('Failed to list files');
    }
  }

  async saveFilesToDrive(fileUrls: string[]): Promise<any[]> {
    return Promise.all(
      fileUrls.map(async (fileUrl) => {
        try {
          const { data: fileStream, headers } = await axios.get(fileUrl, { responseType: 'stream' });
          const fileName = this.getFileNameFromHeaders(fileUrl, headers);
          const mimeType = headers['content-type'];

          const fileId = await this.uploadStreamToDrive(fileName, fileStream, mimeType);

          return { fileUrl, fileName, fileId };
        } catch (error) {
          console.error(`Error processing file from URL: ${fileUrl}`, error.message);
          return { fileUrl, error: error.message };
        }
      }),
    );
  }

  private async getWorkingFolderId(): Promise<string | null> {
    const response = await this.drive.files.list({
      q: `name='${GoogleDriveService.WORKING_DIRECTORY_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    return null;
  }

  private getFileNameFromHeaders(fileUrl: string, headers: any): string {
    if (headers['content-disposition']) {
      const match = headers['content-disposition'].match(/filename="(.+)"/);

      if (match) {
        return match[1];
      }
    }

    return path.basename(new URL(fileUrl).pathname);
  }

  private async uploadStreamToDrive(fileName: string, fileStream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const passThrough = new PassThrough();
    fileStream.pipe(passThrough);

    const response = await this.drive.files.create({
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

    return response.data.id;
  }
}
