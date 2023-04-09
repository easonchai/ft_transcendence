import { Body, Controller, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ChannelMessages, Channels, ChannelUsers, Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from 'src/exceptions/prisma-client-exception.filter';
import { createChannelDto, createChannelMessagesDto, getChannelMessagesDto, getChannelsDto, getChannelUsersDto, updateChannelDto } from './channels.dto';
import { ChannelsService } from './channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(
		private readonly channelsService: ChannelsService,
	) {}
	
	// Get
	
	@Get()
	@ApiOperation({ summary: 'Get all channels' })
	@ApiOkResponse({
		type: getChannelsDto,
		isArray: true
	})
	async getAllChannels() {
		return this.channelsService.getAllChannels();
	}
	
	@Get(':id')
	@ApiOperation({ summary: 'Get a channel by channel id' })
	@ApiOkResponse({
		type: getChannelsDto,
	})
	async getChannelById(@Param('id') id: number) {
		return this.channelsService.getChannelById(id);
	}
	
	@Get(':id/mesages')
	@ApiOperation({ summary: 'Get channel messages by channel id' })
	@ApiOkResponse({
		type: getChannelMessagesDto,
		isArray: true,
	})
	getMessagesByChannelId(@Param('id') id: number) {
		return this.channelsService.getMessegesByChannelId(id);
	}
	
	@Get(':id/users')
	@ApiOperation({ summary: 'Get channel users by channel id' })
	@ApiOkResponse({
		type: getChannelUsersDto,
		isArray: true
	})
	getUsersByChannelId(@Param('id') id: number) {
		return this.channelsService.getUsersByChannelId(id);
	}
	
	// Post
	
	@Post()
	@ApiOperation({ summary: 'Create channel' })
	@ApiOkResponse({
		type: getChannelsDto
	})
	async createChannel(@Body() body: createChannelDto) {
		return await this.channelsService.createChannel(body);
	}
	
	@Post(':id/message')
	@ApiOperation({ summary: 'Create channel message' })
	@ApiOkResponse({
		type: getChannelMessagesDto
	})
	async createChannelMessages(@Body() body: createChannelMessagesDto) {
		return await this.channelsService.createChannelMessages(body);
	}
	
	// Patch
	
	@Patch(':id')
	@ApiOperation({ summary: 'Update channel' })
	@ApiOkResponse({ 
		type: updateChannelDto
	})
	async updateChannel(@Param('id') id: number, @Body() body: updateChannelDto) {
		return await this.channelsService.updateChannel(id, body);
	}
}
