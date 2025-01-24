import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleAuthService } from '../google-auth/google-auth.service';

@Injectable()
export class GoogleDriveService {
  private drive;

  constructor(private readonly authService: GoogleAuthService) {
    this.initializeDrive();
  }

  private async initializeDrive() {
    const authClient = await this.authService.getAuthClient();

    this.drive = google.drive({
      version: 'v3',
      auth: authClient,
    });
  }

  // TODO: add types
  async listFiles(): Promise<any> {
    try {
      const response = await this.drive.files.list({
        fields: 'files(mimeType,id,name,webViewLink,parents)',
        pageSize: 10,
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing files from Google Drive:', error.message);
      throw new Error('Failed to list files');
    }
  }
}
