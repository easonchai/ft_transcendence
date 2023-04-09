import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, PrismaService } from './app.service';
import { ChannelsModule } from './channels/channels.module';
import { PrismaClientExceptionFilter } from './exceptions/prisma-client-exception.filter';
import { AppExceptionFilter } from './exceptions/app_exception';

@Module({
  imports: [ChannelsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppExceptionFilter, PrismaClientExceptionFilter],
})
export class AppModule {}
