import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, PrismaService } from './app.service';
import { ChannelsModule } from './channels/channels.module';
import { AppExceptionFilter } from './exceptions/app_exception.filter';
import { MatchesModule } from './matches/matches.module';
import { AuthGuard } from './guards/auth.guards';
import { APP_GUARD } from '@nestjs/core';
import { RootGateway } from './gateways/root.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './user/user.module';

@Module({
  imports: [
		ChannelsModule,
		MatchesModule,
		UserModule,
		MulterModule.register({
			dest: './uploads',
		})
	],
  controllers: [AppController],
  providers: [
		AppService,
		PrismaService,
		AppExceptionFilter, 
		{ provide: APP_GUARD, useClass: AuthGuard },
		RootGateway
	]
})
export class AppModule {}
