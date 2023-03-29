import { Module } from '@nestjs/common';
import { UserFriendService } from './user-friend.service';

@Module({
  providers: [UserFriendService]
})
export class UserFriendModule {}
