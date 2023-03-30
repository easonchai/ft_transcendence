import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ControllerModule } from './user/controller/controller.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserFriendModule } from './user-friend/user-friend.module';
// import { UserFriendModule } from './user-friend/user-friend.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UserModule, UserFriendModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
