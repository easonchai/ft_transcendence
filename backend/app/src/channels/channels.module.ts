import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { PrismaService } from 'src/app.service';
import { ChannelsGateway } from './channels.gateway';

@Module({
  providers: [ChannelsService, PrismaService, ChannelsGateway],
  controllers: [ChannelsController]
})
export class ChannelsModule {}
