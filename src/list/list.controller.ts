import { Controller, Get } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Controller('list')
export class ListController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get()
  async listFiles() {
    const files = await this.googleDriveService.listFiles();
    return {
      message: 'Files retrieved successfully',
      files,
    };
  }
}
