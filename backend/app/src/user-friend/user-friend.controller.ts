import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserFriendService } from './user-friend.service';

@Controller('user-friend')
@ApiTags('friends')
export class UserFriendController {

	constructor(private userFriendService: UserFriendService) { }

	@Get(':id')
	async getAllFriends(@Param('id') id: string) {
		return this.userFriendService.getAllFriends();
	}
}
