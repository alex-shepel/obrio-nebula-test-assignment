import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library/build/src/auth/googleauth';
import { auth } from 'googleapis/build/src/apis/drive';

@Injectable()
export class GoogleAuthService {
  private readonly authClient: GoogleAuth;

  constructor(private readonly configService: ConfigService) {
    const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');

    this.authClient = new auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })
  }

  async getAuthClient(): Promise<GoogleAuth> {
    return this.authClient;
  }
}
