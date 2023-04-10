import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, PrismaService } from './app.service';
import { ChannelsModule } from './channels/channels.module';
import { PrismaClientExceptionFilter } from './exceptions/app_exception.filter';

@Module({
  imports: [ChannelsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, PrismaClientExceptionFilter],
})
export class AppModule {}
