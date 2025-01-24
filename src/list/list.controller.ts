import { Controller, Get } from '@nestjs/common';

@Controller('list')
export class ListController {
  @Get()
  async list() {
    return {
      files: [
        'path/file1',
        'path/file2',
      ],
    };
  }
}
