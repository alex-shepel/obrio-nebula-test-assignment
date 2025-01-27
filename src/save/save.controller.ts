import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { DriveFileSaveResult } from 'src/google-drive/google-drive.types';

@Controller('save')
export class SaveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post()
  async saveFiles(@Body('links') filesUrls: string[]): Promise<DriveFileSaveResult[]> {
    if (!Array.isArray(filesUrls) || filesUrls.length === 0) {
      throw new HttpException(
        `Array of files links must be provided`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.googleDriveService.saveFilesToDrive(filesUrls);
  }
}
