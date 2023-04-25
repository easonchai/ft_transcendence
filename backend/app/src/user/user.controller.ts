import { Body, Controller, Delete, FileTypeValidator, Get, HttpException, HttpStatus, Logger, Param, ParseFilePipe, Patch, Post, Put, Req, Request, RequestMethod, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { FileInterceptor } from '@nestjs/platform-express';
import { ChannelUsers, Channels, User, UserBlocks, UserFriends, UserMessages } from '@prisma/client';
import { UserService } from './user.service';
// import { UserDto, UserResponseDto } from './dto';
// import { Request, Response } from 'express';
import { Express } from 'express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImageMulterOptions } from 'src/utils/UploadHelper';
import { GetUserChannels, GetUserDto, GetUserFriends, GetUserMessages, UpdateUserDto, GetUserBlock, UpdateUserFriendsDto } from './user.dto';
import { UserId } from 'src/decorators/user_id.decorators';
import { GetChannelsDto } from 'src/channels/channels.dto';
import { Public } from 'src/decorators/public.decorators';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) { }

	@Get()
	@ApiOperation({ summary: "Get all users" })
	@ApiResponse({
		status: 200,
		description: 'All users has been successfully fetched',
		type: GetUserDto
	})
	async getAllUser(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getAllUser(auth_user_id);
	}

	@Get('/user/:id')
	@ApiOperation({ summary: "Get user by id" })
	@ApiOkResponse({ type: GetUserDto })
	async getUserById(@Param('id') id: string, @UserId() auth_user_id: string): Promise<User> {
		return await this.userService.getUserById(id, auth_user_id);
	}
	
	@Get('friends/:id')
	@ApiOperation({ summary: "Get accepted friends" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getAcceptedUserFriends(@Param('id') id: string, @UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getAcceptedUserFriends(id, auth_user_id);
	}
	
	@Get('pending')
	@ApiOperation({ summary: "Get pending friends" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getPendingUserFriends(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getPendingUserFriends(auth_user_id);
	}
	
	@Get('requested')
	@ApiOperation({ summary: "Get requested friends" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getRequestedUserFriends(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getRequestedUserFriends(auth_user_id);
	}
	
	@Get('blocked')
	@ApiOperation({ summary: "Get blocked" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getUserBlock(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getUserBlock(auth_user_id);
	}
	
	@Get('blockedby')
	@ApiOperation({ summary: "Get blocked by" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getUserBlockBy(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getUserBlockBy(auth_user_id);
	}
	
	@Get('messages/:id')
	@ApiOperation({ summary: "Get user messages" })
	@ApiOkResponse({ type: GetUserMessages, isArray: true })
	async getUserMessages(@Param('id') id: string, @UserId() auth_user_id: string): Promise<UserMessages[]> {
		return await this.userService.getUserMessages(id, auth_user_id);
	}
	
	@Get('chats')
	@ApiOperation({ summary: "Get user chats" })
	@ApiOkResponse({ type: GetUserDto, isArray: true })
	async getUserChats(@UserId() auth_user_id: string): Promise<User[]> {
		return await this.userService.getUserChats(auth_user_id);
	}
	
	@Get('channels')
	@ApiOperation({ summary: "Get user channels" })
	@ApiOkResponse({ type: GetChannelsDto, isArray: true })
	async getUserChannels(@UserId() auth_user_id: string): Promise<Channels[]> {
		return await this.userService.getUserChannels(auth_user_id);
	}
	

	@Get('image/:id')
	// @Public()
	@ApiOperation({ summary: "Get user image" })
	@ApiOkResponse({ type: Blob }) 
	async getUserImage(@Param(':id') id: string, @UserId() auth_user_id: string) {
		return await this.userService.getUserImage(id, auth_user_id);
	}
	
	// Post
	
	@Post('/friends/:id')
	@ApiOperation({ summary: "Add user friend" })
	@ApiOkResponse({ type: GetUserFriends })
	async createUserFriends(@Param('id') id: string, @UserId() auth_user_id: string): Promise<UserFriends> {
		return await this.userService.createUserFriends(id, auth_user_id);
	}
	
	@Post('/block/:id')
	@ApiOperation({ summary: "Ban user" })
	@ApiOkResponse({ type: GetUserBlock })
	async createUserBlock(@Param('id') id: string, @UserId() auth_user_id: string): Promise<UserBlocks> {
		return await this.userService.createUserBlocks(id, auth_user_id);
	}
	
	// Patch
	
	@Patch()
	@ApiOperation({ summary: "Update user" })
	@ApiOkResponse({ type: GetUserDto })
	async updateUser(@Body() body: UpdateUserDto, @UserId() auth_user_id: string) {
		return await this.userService.updateUser(body, auth_user_id);
	}
	
	@Patch('/friends/:id')
	@ApiOperation({ summary: "Update friend request" })
	@ApiOkResponse({ type: GetUserFriends })
	async updateUserFriends(@Param('id') id: string, @Body() body: UpdateUserFriendsDto, @UserId() auth_user_id: string) {
		return await this.userService.updateUserFriends(id, body, auth_user_id);
	}
	
	@Patch('image')
	@ApiOperation({ summary: "Upload image" })
	@ApiOkResponse({ type: GetUserDto })
	@UseInterceptors(FileInterceptor('file', ImageMulterOptions))
	async updateUserImage(@UploadedFile() file: Express.Multer.File, @UserId() auth_user_id: string) {
		return await this.userService.updateUserImage(file.path, auth_user_id);
	}
	
	// Delete
	
	@Delete('/friends/:id')
	@ApiOperation({ summary: "Delete friend" })
	@ApiOkResponse({ type: GetUserFriends })
	async deleteUserFriend(@Param('id') id: string, @UserId() auth_user_id: string) {
		return await this.userService.deleteUserFriend(id, auth_user_id);
	}
	
	@Delete('/block/:id')
	@ApiOperation({ summary: "Delete block" })
	@ApiOkResponse({ type: GetUserBlock })
	async deleteUserBlock(@Param('id') id: string, @UserId() auth_user_id: string) {
		return await this.userService.deleteUserBlock(id, auth_user_id);
	}

}

