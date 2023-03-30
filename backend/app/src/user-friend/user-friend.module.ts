import { Module } from '@nestjs/common';
import { UserFriendController } from './user-friend.controller';
import { UserFriendService } from './user-friend.service';

@Module({
	controllers: [UserFriendController],
	providers: [UserFriendService]
})
export class UserFriendModule { }
