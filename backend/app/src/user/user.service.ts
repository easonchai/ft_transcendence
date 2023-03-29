import { Body, HttpException, HttpStatus, Injectable, Response } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async getAllUser() {
		return this.prisma.user.findMany();
	}

	async getUserById(id: string) {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		return (user);
	}

	async getUserImageById(id: string): Promise<string> {
		const user = await this.prisma.user.findFirst({ where: { id: id } });
		if (!user)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		return (user.image);
	}

	async createNewUser(userDto: UserDto) {
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
}
