import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserFriends } from '@prisma/client';
import { UserFriendDto, UserFriendResponseDto } from './dto';
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

	@Get(':id/friend-request')
	@ApiOperation({ summary: "Get all pending friend requests for specified user" })
	async getAllFriendRequests(@Param('id') id: string): Promise<UserFriendResponseDto[]> {
		return this.userFriendService.getAllFriendRequests(id);
	}

	@Post(':id/friend-request/:friendId')
	@ApiOperation({ summary: "User requesting for friend request" })
	async createFriendRequest(@Param('id') id: string, @Param('friendId') friendId: string){
		return this.userFriendService.createFriendRequest(id, friendId);
	}

	@Put(':id/friend-request-acceptance/:friendId')
	@ApiOperation({ summary: "userId accept friend request from friendId" })
	async acceptFriendRequest(@Param('id') id: string, @Param('friendId') friendId: string) {
		return this.userFriendService.acceptFriendRequest(id, friendId);
	}

	@Put(':id/friend-request-rejection/:friendId')
	@ApiOperation({ summary: "userId reject friend request from friendId" })
	async declineFriendRequest(@Param('id') id: string, @Param('friendId') friendId: string) {
		return this.userFriendService.declineFriendRequest(id, friendId);
	}

	@Delete(':id/friend-request/:friendId')
	@ApiOperation({ summary: "Delete friend for both side" })
	async deleteFriend(@Param('id') id: string, @Param('friendId') friendId: string) {
		return this.userFriendService.deleteFriend(id, friendId);
	}

}
