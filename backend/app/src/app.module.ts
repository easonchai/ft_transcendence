import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, PrismaService } from './app.service';
import { ChannelsModule } from './channels/channels.module';
import { AppExceptionFilter } from './exceptions/app_exception.filter';
import { MatchesModule } from './matches/matches.module';
import { AuthGuard } from './guards/auth.guards';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ChannelsModule, MatchesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppExceptionFilter, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
