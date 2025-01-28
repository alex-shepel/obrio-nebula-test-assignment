import { Module } from '@nestjs/common';
import { ListController } from './list/list.controller';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { ConfigModule } from '@nestjs/config';
import { SaveController } from './save/save.controller';
import { FileFetchService } from 'src/file-fetch/file-fetch.service';
import { SaveService } from 'src/save/save.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ListController, SaveController],
  providers: [GoogleDriveService, GoogleAuthService, FileFetchService,  SaveService],
})
export class AppModule {}
