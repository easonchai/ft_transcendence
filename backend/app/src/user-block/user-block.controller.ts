import { Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { create } from 'domain';
import { UserBlockDto, UserBlockResponseDto } from './dto';
import { UserBlockService } from './user-block.service';

@Controller('user-block')
@ApiTags('block')
export class UserBlockController {
	constructor(private userBlockService: UserBlockService) { }

	@Post(':id/:friend-id')
	@ApiOperation({ summary: "Get all user's friends" })
	async createBlockUser(@Param('id') id: string, @Param('friend-id') friendId: string): Promise<UserBlockResponseDto> {
		return this.userBlockService.createBlockUser(id, friendId);
	}
}
