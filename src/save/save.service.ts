import { Injectable } from '@nestjs/common';
import { DriveFileSaveResult } from 'src/google-drive/google-drive.types';
import { FileFetchService } from 'src/file-fetch/file-fetch.service';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Injectable()
export class SaveService {
  constructor(
    private readonly fileFetchService: FileFetchService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async saveFiles(filesUrls: string[]): Promise<DriveFileSaveResult[]> {
    return Promise.all(
      filesUrls.map(async (fileUrl) => {
        try {
          const {
            fileName,
            fileSize,
          } = await this.fileFetchService.getFileMetadata(fileUrl);

          const fileStream = await this.fileFetchService
            .getFileStream(fileUrl);

          const fileId = await this.googleDriveService
            .streamFileToDrive(fileStream, fileName, fileSize);

          return { fileUrl, fileName, fileId };
        } catch (error) {
          return { fileUrl, error: error.message };
        }
      }),
    );
  }
}
