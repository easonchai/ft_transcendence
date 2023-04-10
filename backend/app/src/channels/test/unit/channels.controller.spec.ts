import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from '../../channels.controller';
import { ChannelsService } from '../../channels.service';
import { ChannelsStubs } from './stubs/channels.stubs';
import { CreateChannelDto, GetChannelMessagesDto, GetChannelUsersDto, GetChannelsDto } from '../../channels.dto';
import { ChannelMessagesStubs } from './stubs/channel_messages.stubs';
import { ChannelUsersStubs } from './stubs/channel_users.stubs';

jest.mock('./channels.service');

describe('ChannelsController', () => {
  let channelsController: ChannelsController;
	let channelsService: ChannelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [],
      controllers: [ChannelsController],
			providers: [ChannelsService],
    }).compile();

    channelsController = module.get<ChannelsController>(ChannelsController);
		channelsService = module.get<ChannelsService>(ChannelsService);
		jest.clearAllMocks();
  });
	
	describe('getChannelById', () => {
		describe('when getChannelById is called', () => {
			let channel: GetChannelsDto;
			
			beforeEach(async () => {
				channel = await channelsController.getChannelById(ChannelsStubs().id);
			})
			
			test('then it should call channelsService', () => {
				expect(channelsService.getChannelById).toBeCalledWith(ChannelsStubs().id);
			})
			
			test('then it should return a channel', () => {
				expect(channel).toEqual(ChannelsStubs());
			})
		})
	})
	
	describe('getAllChannels', () => {
		describe('when getAllChannels is called', () => {
			let channels: GetChannelsDto[];
			
			beforeEach(async () => {
				channels = await channelsController.getAllChannels();
			})
			
			test('then it should call channelService', () => {
				expect(channelsService.getAllChannels).toBeCalled();
			})
			
			test('then it should return all channels', () => {
				expect(channels).toEqual([ChannelsStubs()]);
			})
		})
	})
	
	describe('getChannelMessagesByChannelId', () => {
		describe('when getChannelMessagesByChannelId is called', () => {
			let channelMessages: GetChannelMessagesDto[];
			
			beforeEach(async () => {
				channelMessages = await channelsController.getChannelMessagesByChannelId(ChannelMessagesStubs().id);
			})
			
			test('then it should call channelService', () => {
				expect(channelsService.getChannelMessegesByChannelId).toBeCalledWith(ChannelMessagesStubs().id);
			})
			
			test('then it should return all messages in the channel', () => {
				expect(channelMessages).toEqual([ChannelMessagesStubs()]);
			})
		})
	})
	
	describe('getChannelUserByChannelId', () => {
		describe('when getChannelUserBychannelId is called', () => {
			let channelUsers: GetChannelUsersDto[];
			
			beforeEach(async () => {
				channelUsers = await channelsController.getChannelUsersByChannelId(ChannelUsersStubs().channel_id);
			})
			
			test('then it should call channelService', () => {
				expect(channelsService.getChannelUsersByChannelId).toBeCalledWith(ChannelUsersStubs().channel_id);
			})
			
			test('then it should return all channel users in the channel', () => {
				expect(channelUsers).toEqual([ChannelUsersStubs()]);
			})
		})
	})
	
	describe('createChannel', () => {
		describe('when createChannel is called', () => {
			let createdChannel: GetChannelsDto;
			let createChannelDto: CreateChannelDto;
			
			beforeEach(async () => {
				createChannelDto = {
					name: ChannelsStubs().name,
					type: ChannelsStubs().type,
				}
				createdChannel = await channelsController.createChannel(createChannelDto);
			})
			
			test('then it should call channelService', () => {
				expect(channelsService.createChannel).toBeCalledWith(createChannelDto);
			})
			
			test('then it should return the created channel', () => {
				expect(createdChannel).toEqual(ChannelsStubs());
			})
		})
	})
	
});
