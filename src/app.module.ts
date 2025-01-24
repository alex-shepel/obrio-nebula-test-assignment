import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListController } from './list/list.controller';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ListController],
  providers: [AppService, GoogleDriveService, GoogleAuthService],
})
export class AppModule {}
