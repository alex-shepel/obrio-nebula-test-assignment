import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  GoogleDriveService,
} from 'src/google-drive/google-drive.service';

@Controller('save')
export class SaveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post()
  async saveFiles(@Body('links') filesUrls: string[]) {
    if (!Array.isArray(filesUrls) || filesUrls.length === 0) {
      throw new HttpException(
        `Array of files links must be provided`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.googleDriveService.saveFilesToDrive(filesUrls);
  }
}
