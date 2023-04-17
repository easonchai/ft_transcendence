import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserFriendModule } from './user-friend/user-friend.module';
import { UserBlockModule } from './user-block/user-block.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UserModule, UserFriendModule, UserBlockModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
