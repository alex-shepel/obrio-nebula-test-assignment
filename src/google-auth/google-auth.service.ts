import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleAuthService {
  private authClient;

  constructor(private readonly configService: ConfigService) {
    const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');

    this.authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }

  // TODO: add types
  async getAuthClient(): Promise<any> {
    return this.authClient.getClient();
  }
}
