import { Controller, Get } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { DriveFile } from 'src/google-drive/google-drive.types';

@Controller('list')
export class ListController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get()
  async listFiles(): Promise<DriveFile[]> {
    return this.googleDriveService.listFiles();
  }
}
