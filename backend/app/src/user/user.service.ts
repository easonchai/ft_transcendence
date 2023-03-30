import { Body, HttpException, HttpStatus, Injectable, Response } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto, UserResponseDto } from './dto';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async getAllUser(): Promise<UserResponseDto[]> {
		const users = await this.prisma.user.findMany();
		return users.map(user => new UserResponseDto(user));
	}

	async getUserById(id: string): Promise<UserResponseDto> {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		return (new UserResponseDto(user));
	}

	async getUserImageById(id: string): Promise<string> {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		return (user.image);
	}

	async createNewUser(userDto: UserDto): Promise<User> {
		if (!userDto.image)
			userDto.image = "uploads/profileimages/github-logo4ff49d17-2ed4-483c-ba50-b671e53648d8.png";
		return this.prisma.user.create({ data: userDto });
	}

	async updateUserById(id: string, userDto: UserDto) {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		return this.prisma.user.update({
			where: { id },
			data: userDto
		});
	}

	async uploadUserImage(id: string, image: string) {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		user.image = image;
		return this.prisma.user.update({
			where: { id },
			data: image
		});
	}
}
