import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Req, Request, RequestMethod, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UserDto, UserResponseDto } from './dto';
import { Response } from 'express';
import { Express } from 'express';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

export const storage = {
	storage: diskStorage({
		destination: './uploads/profileimages',
		filename: (req, file, cb) => {
			const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const extension: string = path.parse(file.originalname).ext;

			cb(null, `${filename}${extension}`)
		}
	})
}

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) { }

	@Get()
	@ApiOperation({ summary: "Get all users" })
	@ApiResponse({
		status: 200,
		description: 'All users has been successfully fetched',
		type: UserResponseDto
	})
	async getAllUser(): Promise<UserResponseDto[]> {
		return this.userService.getAllUser();
	}

	@Get(':id')
	@ApiOperation({ summary: "Get user by id" })
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Should be an id of a user that exists in the database',
		type: String
	})
	@ApiResponse({
		status: 200,
		description: 'A user has been successfully fetched',
		type: UserResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'A user with given id does not exist.'
	})
	async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
		return this.userService.getUserById(id);
	}

	@Get(':id/image')
	@ApiOperation({ summary: "download user image by id" })
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Should be an id of a user that exists in the database',
		type: String
	})
	@ApiResponse({
		status: 200,
		description: 'A user has been successfully fetched',
		type: UserResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'A user with given id does not exist.'
	})
	async getUserImageById(@Param('id') id: string, @Res() response: Response) {
		const image = await this.userService.getUserImageById(id);
		if (!image)
			throw new HttpException('image not found', HttpStatus.NOT_FOUND);
		return response.sendFile(image);
	}

	@Post()
	@ApiOperation({ summary: "Create new user" })
	async createNewUser(@Body(new ValidationPipe({ transform: true })) userDto: UserDto, @Req() request: Request): Promise<User> {
		return this.userService.createNewUser(userDto);
	}

	@Post('/:id/upload_avatar')
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: "Upload user image by id" })
	@UseInterceptors(FileInterceptor('file', storage))
	async uploadFile(@Param('id') id: string, @UploadedFile() file, @Request() req) {
		// const user: User = req.user;
		// console.log(file);
		return this.userService.uploadUserImage(id, file.path);
		// return ({ imagePath: file.path });
	}

	@Put('/:id')
	@ApiOperation({ summary: "Update user details by id" })
	async updateUserById(@Param('id') id: string, @Body() userDto: UserDto) {
		return this.userService.updateUserById(id, userDto);
	}



}

