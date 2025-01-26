import { Module } from '@nestjs/common';
import { ListController } from './list/list.controller';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { ConfigModule } from '@nestjs/config';
import { SaveController } from './save/save.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ListController, SaveController],
  providers: [GoogleDriveService, GoogleAuthService],
})
export class AppModule {}
