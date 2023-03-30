import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.service';
import { UserResponseDto } from './dto';

@Injectable()
export class UserFriendService {

	constructor(private prisma: PrismaService) { }

	async getAllFriends(id: string) {
		const friends = await this.prisma.userFriends.findMany({
			where: {
				{
				user_id: id, status: 
			},
			include: {
		}
		})
}
}