import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChannelMessages, Channels, ChannelUsers, Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from 'src/exceptions/app_exception.filter';
import { CreateChannelDto, CreateChannelMessagesDto, CreateChannelUserDto, GetChannelMessagesDto, GetChannelsDto, GetChannelUsersDto, UpdateChannelDto } from './channels.dto';
import { ChannelsService } from './channels.service';

@Controller('channels')
@ApiTags('Channels')
export class ChannelsController {
	constructor(
		private readonly channelsService: ChannelsService,
	) {}
	
	// Get
	
	@Get()
	@ApiOperation({ summary: 'Get all channels' })
	@ApiOkResponse({
		type: GetChannelsDto,
		isArray: true
	})
	async getAllChannels() {
		return this.channelsService.getAllChannels();
	}
	
	@Get(':id')
	@ApiOperation({ summary: 'Get a channel by channel id' })
	@ApiOkResponse({
		type: GetChannelsDto,
	})
	async getChannelById(@Param('id') id: number) {
		return this.channelsService.getChannelById(id);
	}
	
	@Get(':id/mesages')
	@ApiOperation({ summary: 'Get channel messages by channel id' })
	@ApiOkResponse({
		type: GetChannelMessagesDto,
		isArray: true,
	})
	getChannelMessagesByChannelId(@Param('id') id: number) {
		return this.channelsService.getChannelMessegesByChannelId(id);
	}
	
	@Get(':id/users')
	@ApiOperation({ summary: 'Get channel users by channel id' })
	@ApiOkResponse({
		type: GetChannelUsersDto,
		isArray: true
	})
	getChannelUsersByChannelId(@Param('id') id: number) {
		return this.channelsService.getChannelUsersByChannelId(id);
	}
	
	// Post
	
	@Post()
	@ApiOperation({ summary: 'Create channel' })
	@ApiOkResponse({
		type: GetChannelsDto
	})
	async createChannel(@Body() body: CreateChannelDto) {
		return await this.channelsService.createChannel(body);
	}
	
	@Post(':id/message')
	@ApiOperation({ summary: 'Create channel message' })
	@ApiOkResponse({
		type: GetChannelMessagesDto
	})
	async createChannelMessages(@Body() body: CreateChannelMessagesDto) {
		return await this.channelsService.createChannelMessages(body);
	}
	
	@Post(':id')
	@ApiOperation({ summary: 'Join channel' })
	@ApiOkResponse({
		type: GetChannelUsersDto
	})
	async createChannelUserByJoin(@Param('id') id: number, @Body() body: CreateChannelUserDto) {
		return await this.channelsService.createChannelUsers(id);
	}
	
	@Post(':id/add/:user_id')
	@ApiOperation({ summary: 'Add to channel' })
	@ApiOkResponse({
		type: GetChannelsDto
	})
	async createChannelUserByAdd(@Param('id') id: number, @Param('user_id') user_id: string) {
		return await this.channelsService.
	}
	
	
	// Patch
	
	@Patch(':id')
	@ApiOperation({ summary: 'Update channel' })
	@ApiOkResponse({ 
		type: UpdateChannelDto
	})
	async updateChannel(@Param('id') id: number, @Body() body: UpdateChannelDto) {
		return await this.channelsService.updateChannel(id, body);
	}
	
	// Delete
	
	@Delete(':id')
	@ApiOperation({ summary: 'Leave channel' })
	async deleteChannelUsers(@Param('id') id: number) {
		return await this.channelsService.deleteChannelUsers(id);
	}
}
