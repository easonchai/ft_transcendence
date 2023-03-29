import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Req, Request, RequestMethod, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { Response } from 'express';
import { Express } from 'express';

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


@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	async getAllUser() {
		return this.userService.getAllUser();
	}
	
	@Get(':id')
	async getUserById(@Param('id') id: string) {
		return this.userService.getUserById(id);
	}

	@Get(':id/image')
	async getUserImageById(@Param('id') id: string, @Res() response: Response) {
		const image =  await this.userService.getUserImageById(id);
		if (!image)
			throw new HttpException('image not found', HttpStatus.NOT_FOUND);
		return response.sendFile(image);
	}

	@Post()
	async createNewUser(@Body(new ValidationPipe({transform: true})) userDto: UserDto, @Req() request: Request) {
		return this.userService.createNewUser(userDto);
	}

	@Post('/upload_avatar')
	@UseInterceptors(FileInterceptor('file', storage))
	async uploadFile(@UploadedFile() file, @Request() req) {
		const user: User = req.user;
		console.log(file);
		return ({ imagePath: file.path });
	}

	@Put('/:id')
	async updateUserById(@Param('id') id: string, @Body() userDto: UserDto)
	{
		return this.userService.updateUserById(id, userDto);
	}



}

