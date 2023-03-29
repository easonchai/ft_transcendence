import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService, PrismaService, UserService } from './app.service';
// import { ControllerModule } from './user/controller/controller.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserFriendController } from './user-friend/user-friend.controller';
import { UserFriendModule } from './user-friend/user-friend.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, PrismaModule, UserFriendModule],
	controllers: [AppController, UserFriendController],
	providers: [AppService, UserService, PrismaService],
})
export class AppModule { }
