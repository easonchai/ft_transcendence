import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateChannelDto, CreateChannelMessagesDto, CreateChannelUsersDto, GetChannelBannedUsers, GetChannelMessagesDto, GetChannelsDto, GetChannelUsersDto, UpdateChannelDto, UpdateChannelUserDto } from './channels.dto';
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
	@ApiOkResponse({ type: GetChannelsDto, isArray: true })
	async getAllChannels() {
		return await this.channelsService.getAllChannels();
	}
	
	@Get(':id')
	@ApiOperation({ summary: 'Get a channel by channel id' })
	@ApiOkResponse({ type: GetChannelsDto, })
	async getChannelById(@Param('id') id: number) {
		return await this.channelsService.getChannelById(id);
	}
	
	@Get(':id/mesages')
	@ApiOperation({ summary: 'Get channel messages by channel id' })
	@ApiOkResponse({ type: GetChannelMessagesDto, isArray: true, })
	async getChannelMessagesByChannelId(@Param('id') id: number) {
		return await this.channelsService.getChannelMessegesByChannelId(id);
	}
	
	@Get(':id/users')
	@ApiOperation({ summary: 'Get channel users by channel id' })
	@ApiOkResponse({ type: GetChannelUsersDto, isArray: true })
	async getChannelUsersByChannelId(@Param('id') id: number) {
		return await this.channelsService.getChannelUsersByChannelId(id);
	}
	
	@Get(':id/banned')
	@ApiOperation({ summary: 'Get channel banned users' })
	@ApiOkResponse({ type: GetChannelBannedUsers, isArray: true })
	async getChannelBannedUsers(@Param('id') id: number) {
		return await this.channelsService.getChannelBannedUsers(id);
	}
	
	// Post
	
	@Post()
	@ApiOperation({ summary: 'Create channel' })
	@ApiOkResponse({ type: GetChannelsDto })
	async createChannel(@Body() body: CreateChannelDto) {
		return await this.channelsService.createChannel(body);
	}
	
	@Post(':id/message')
	@ApiOperation({ summary: 'Create channel message (being handled in websocket)', deprecated: true })
	@ApiOkResponse({ type: GetChannelMessagesDto })
	async createChannelMessages(@Param('id') id: number, @Body() body: CreateChannelMessagesDto) {
		return await this.channelsService.createChannelMessages(id, body);
	}
	
	@Post(':id')
	@ApiOperation({ summary: 'Join channel' })
	@ApiOkResponse({ type: GetChannelUsersDto })
	async createChannelUserByJoin(@Param('id') id: number, @Body() body: CreateChannelUsersDto) {
		return await this.channelsService.createChannelUsersByJoin(id, body);
	}
	
	@Post(':id/add/:user_id')
	@ApiOperation({ summary: 'Add to channel' })
	@ApiOkResponse({ type: GetChannelsDto })
	async createChannelUserByAdd(@Param('id') id: number, @Param('user_id') user_id: string) {
		return await this.channelsService.createChannelUserByAdd(id, user_id);
	}
	
	@Post(':id/banned/:user_id')
	@ApiOperation({ summary: 'Banned channel user' })
	@ApiOkResponse({ type: GetChannelBannedUsers })
	async createChannelBannedUsers(@Param('id') id: number, @Param('user_id') user_id: string) {
		return await this.createChannelBannedUsers(id, user_id);
	}
	
	// Patch
	
	@Patch(':id')
	@ApiOperation({ summary: 'Update channel' })
	@ApiOkResponse({  type: GetChannelUsersDto })
	async updateChannel(@Param('id') id: number, @Body() body: UpdateChannelDto) {
		return await this.channelsService.updateChannel(id, body);
	}
	
	@Patch(':id/user/:user_id')
	@ApiOperation({ summary: 'Update channel user' })
	@ApiOkResponse({ type: GetChannelUsersDto })
	async updateChannelUser(@Param('id') id: number, @Param('user_id') user_id: string, @Body() body: UpdateChannelUserDto) {
		return await this.channelsService.updateChannelUser(id, user_id, body);
	}
	
	// Delete
	
	@Delete(':id')
	@ApiOperation({ summary: 'Delete channel' })
	@ApiOkResponse({ type: GetChannelsDto })
	async deleteChannel(@Param('id') id: number) {
		return await this.channelsService.deleteChannels(id);
	}
	
	@Delete(':id/kick/:user_id')
	@ApiOperation({ summary: 'Kick user from channel' })
	@ApiOkResponse({ type: GetChannelUsersDto })
	async deleteChannelUsersByKick(@Param('id') id: number, @Param('user_id') user_id: string) {
		return await this.channelsService.deleteChannelUsersByKick(id, user_id);
	}
	
	@Delete(':id')
	@ApiOperation({ summary: 'Leave channel' })
	@ApiOkResponse({ type: GetChannelUsersDto })
	async deleteChannelUsersByLeave(@Param('id') id: number) {
		return await this.channelsService.deleteChannelUsersByLeave(id);
	}
	
	@Delete(':id/banned/:user_id')
	@ApiOperation({ summary: 'Unban user' })
	@ApiOkResponse({ type: GetChannelBannedUsers })
	async deleteChannelBannedUsers(@Param('id') id: number, @Param('user_id') user_id: string) {
		return await this.channelsService.deleteChannelBannedUsers(id, user_id);
	}
}