import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserFriends } from '@prisma/client';
import { UserFriendResponseDto } from './dto';
import { UserFriendService } from './user-friend.service';

@Controller('user-friend')
@ApiTags('friends')
export class UserFriendController {

	constructor(private userFriendService: UserFriendService) { }

	@Get(':id')
	@ApiOperation({ summary: "Get all user's friends" })
	async getAllFriends(@Param('id') id: string): Promise<UserFriendResponseDto[]> {
		return this.userFriendService.getAllFriends(id);
	}

	@Get(':id/friendrequest')
	@ApiOperation({ summary: "Get all pending friend requests for specified user" })
	async getAllFriendRequest(@Param('id') id:string): Promise<UserFriendResponseDto[]> {
		return this.userFriendService.getAllFriendRequests(id);
	}

	@Post(':id/friendrequest/:friendId')
	@ApiOperation({ summary: "User requesting for friend request" })
	async createFriendRequest(@Param('id') id:string, @Param('friendId') friendId: string) {
		return this.userFriendService.createFriendRequest(id, friendId);
	}

	@Put(':id/requeststatus/:friendId')
	@ApiOperation({ summary: "User requesting for friend request" })
	async respondFriendRequest(@Param('id') id:string, @Param('friendId') friendId: string, @Body() status: UserFriends) {
		return this.userFriendService.createFriendRequest(id, friendId, status);
	}


}
