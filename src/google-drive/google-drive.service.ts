import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleAuthService } from '../google-auth/google-auth.service';

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
}
