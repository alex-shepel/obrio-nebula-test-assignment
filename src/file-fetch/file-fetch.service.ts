import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import fetch, { Headers } from 'node-fetch';
import * as path from 'path';

@Injectable()
export class FileFetchService {
  private static readonly DEFAULT_MIME_TYPE = 'text/plain';

  async getFileStream(url: string): Promise<Readable> {
    let startByte = 0;

    const response = await fetch(url, {
      headers: {
        Range: `bytes=${startByte}-`,
      },
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return Readable.from(response.body);
  }

  async getFileMetadata(url: string) {
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      throw new Error(`Failed to fetch file metadata. HTTP status: ${response.status}`);
    }

    const mimeType = this.getFileMimeTypeFromHeaders(response.headers);
    const fileName = this.getFileNameFromHeaders(url, response.headers);
    const fileSize = this.getFileSizeFromHeaders(response.headers);

    return { fileSize, mimeType, fileName };
  }

  private getFileNameFromHeaders(fileUrl: string, headers: Headers): string {
    const match = headers.get('content-disposition')?.match(/filename="(.+)"/);

    if (match) {
      return match[1];
    }

    return path.basename(new URL(fileUrl).pathname);
  }

  private getFileSizeFromHeaders(headers: Headers): number {
    const size = parseInt(headers.get('content-length') ?? '0', 10);

    if (isNaN(size)) {
      throw new HttpException(
        'File size is missing or invalid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return size;
  }

  private getFileMimeTypeFromHeaders(headers: Headers): string {
    return headers.get('content-type') ?? FileFetchService.DEFAULT_MIME_TYPE;
  }
}
