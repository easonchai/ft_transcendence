import { Body, Controller, Delete, FileTypeValidator, Get, HttpException, HttpStatus, Param, ParseFilePipe, Patch, Post, Put, Req, Request, RequestMethod, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { FileInterceptor } from '@nestjs/platform-express';
import { ChannelUsers, User, UserBlocks, UserFriends } from '@prisma/client';
import { UserService } from './user.service';
// import { UserDto, UserResponseDto } from './dto';
// import { Request, Response } from 'express';
import { Express } from 'express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImageMulterOptions } from 'src/utils/UploadHelper';
import { GetUserChannels, GetUserDto, GetUserFriends, GetUserMessages, UpdateUserDto, GetUserBlock, UpdateUserFriendsDto } from './user.dto';
import { UserId } from 'src/decorators/user_id.decorators';

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

	@Get(':id')
	@ApiOperation({ summary: "Get user by id" })
	@ApiOkResponse({ type: GetUserDto })
	async getUserById(@Param('id') id: string, @UserId() auth_user_id: string): Promise<User> {
		return await this.userService.getUserById(id, auth_user_id);
	}
	
	@Get(':id/friends')
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
	
	@Get(':id/messages')
	@ApiOperation({ summary: "Get user messages" })
	@ApiOkResponse({ type: GetUserMessages, isArray: true })
	async getUserMessages(@Param('id') id: string, @UserId() auth_user_id: string): Promise<GetUserMessages[]> {
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
	@ApiOkResponse({ type: GetUserChannels, isArray: true })
	async getUserChannels(@UserId() auth_user_id: string): Promise<ChannelUsers[]> {
		return await this.userService.getUserChannels(auth_user_id);
	}
	
	// Post
	
	@Post(':id')
	@ApiOperation({ summary: "Add user friend" })
	@ApiOkResponse({ type: GetUserFriends })
	async createUserFriends(@Param('id') id: string, @UserId() auth_user_id: string): Promise<UserFriends> {
		return await this.userService.createUserFriends(id, auth_user_id);
	}
	
	@Post(':id/block')
	@ApiOperation({ summary: "Ban user" })
	@ApiOkResponse({ type: GetUserBlock })
	async createUserBlock(@Param('id') id: string, @UserId() auth_user_id: string): Promise<UserBlocks> {
		return await this.userService.createUserBlocks(id, auth_user_id);
	}
	
	// Patch
	
	@Post()
	@ApiOperation({ summary: "Update user" })
	@ApiOkResponse({ type: GetUserDto })
	async updateUser(@Body() body: UpdateUserDto, @UserId() auth_user_id: string) {
		return await this.userService.updateUser(body, auth_user_id);
	}
	
	@Post(':id/friends')
	@ApiOperation({ summary: "Update friend request" })
	@ApiOkResponse({ type: GetUserFriends })
	async updateUserFriends(@Param('id') id: string, @Body() body: UpdateUserFriendsDto, @UserId() auth_user_id: string) {
		return await this.userService.updateUserFriends(id, body, auth_user_id);
	}
	
	// Delete
	
	@Delete(':id/friends')
	@ApiOperation({ summary: "Delete friend" })
	@ApiOkResponse({ type: GetUserFriends })
	async deleteUserFriend(@Param('id') id: string, @UserId() auth_user_id: string) {
		return await this.userService.deleteUserFriend(id, auth_user_id);
	}
	
	@Delete(':id/block')
	@ApiOperation({ summary: "Delete block" })
	@ApiOkResponse({ type: GetUserBlock })
	async deleteUserBlock(@Param('id') id: string, @UserId() auth_user_id: string) {
		return await this.userService.deleteUserBlock(id, auth_user_id);
	}
	
	// @Patch('image')
	// @ApiConsumes('multipart/form-data')
	// @UseInterceptors(
	// 	FileInterceptor('image', ImageMulterOptions)
	// )
	// async updateUserImage(@UploadedFile() file: Express.Multer.File) {
	// 	const filename = file?.filename;
	// 	if (!filename) throw new HttpException('File upload error', HttpStatus.BAD_REQUEST);
		
	// }
	
	// @Post('/:id/upload_avatar')
	// @ApiConsumes('multipart/form-data')
	// @ApiOperation({ summary: "Upload user image by id" })
	// @UseInterceptors(FileInterceptor('file', storage))
	// async uploadFile(@Param('id') id: string, @UploadedFile() file, @Request() req) {
	// 	return this.userService.uploadUserImage(id, file.path);
	// }

	// @Put('/:id')
	// @ApiOperation({ summary: "Update user details by id" })
	// async updateUserById(@Param('id') id: string, @Body() userDto: UserDto) {
	// 	return this.userService.updateUserById(id, userDto);
	// }



}

