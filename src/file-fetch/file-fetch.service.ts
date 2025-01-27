import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import fetch, { Headers } from 'node-fetch';
import * as path from 'path';

@Injectable()
export class FileFetchService {
  private static readonly DEFAULT_MIME_TYPE = 'text/plain';

  private static readonly httpAgent: HttpAgent = new HttpAgent({ keepAlive: true });
  private static readonly httpsAgent: HttpsAgent = new HttpsAgent({ keepAlive: true });

  async fetchFileStream(url: string) {
    const isHttps = url.startsWith('https://');
    const agent = isHttps ? FileFetchService.httpsAgent : FileFetchService.httpAgent;

    const response = await fetch(url, { agent });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch file. HTTP status: ${response.status}`);
    }

    const mimeType = response.headers.get('content-type') ?? FileFetchService.DEFAULT_MIME_TYPE;

    const fileName = this.getFileNameFromHeaders(url, response.headers);

    const fileStream = Readable.from(response.body);

    return {
      fileStream,
      fileName,
      mimeType,
    };
  }

  private getFileNameFromHeaders(fileUrl: string, headers: Headers): string {
    const match = headers.get('content-disposition')?.match(/filename="(.+)"/);

    if (match) {
      return match[1];
    }

    return path.basename(new URL(fileUrl).pathname);
  }
}
