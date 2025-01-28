import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DriveFileSaveResult } from 'src/google-drive/google-drive.types';
import { SaveService } from 'src/save/save.service';

@Controller('save')
export class SaveController {
  constructor(private readonly saveService: SaveService) {}

  @Post()
  async saveFiles(@Body('links') filesUrls: string[]): Promise<DriveFileSaveResult[]> {
    if (!Array.isArray(filesUrls) || filesUrls.length === 0) {
      throw new HttpException(
        `Array of files links must be provided`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.saveService.saveFiles(filesUrls);
  }
}
