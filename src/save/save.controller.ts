import { Body, Controller, Post } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Controller('save')
export class SaveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post()
  async saveFiles(@Body('links') filesUrls: string[]) {
    if (!Array.isArray(filesUrls) || filesUrls.length === 0) {
      return { error: 'No file URLs provided' };
    }

    const results = await this.googleDriveService.saveFilesToDrive(filesUrls);

    return {
      message: 'Files processed successfully',
      results,
    };
  }
}
