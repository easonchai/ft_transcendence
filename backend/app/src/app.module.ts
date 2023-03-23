import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, PrismaService, UserService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
