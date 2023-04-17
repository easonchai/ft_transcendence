import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.service';
import { UserBlockResponseDto } from './dto';

@Injectable()
export class UserBlockService {
	constructor(private prisma: PrismaService) { }

	async createBlockUser(blockerId: string, blockedId: string): Promise<UserBlockResponseDto> {
		const isBlock = await this.prisma.userBlocks.findFirst({
			where: {
				blocker_id: blockerId,
				blocked_id: blockedId,
			}
		});
		if (isBlock)
			throw new BadRequestException('User already been blocked!');
		const newBlock = await this.prisma.userBlocks.create({
			data: { blocker_id: blockerId, blocked_id: blockedId },
			include: {
				blocker: true,
				blocked: true,
			}
		})
		return new UserBlockResponseDto(newBlock, newBlock.blocker, newBlock.blocked);
	}
}
