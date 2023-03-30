import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserFriendController } from './user-friend.controller';
import { UserFriendService } from './user-friend.service';

@Module({
	// imports: [PrismaModule],
	controllers: [UserFriendController],
	providers: [UserFriendService],
})
export class UserFriendModule { }
