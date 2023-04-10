import { ChannelMessagesStubs } from "../stubs/channel_messages.stubs";
import { ChannelUsersStubs } from "../stubs/channel_users.stubs";
import { ChannelsStubs } from "../stubs/channels.stubs";

export const ChannelsService = jest.fn().mockReturnValue({
	getAllChannels: jest.fn().mockResolvedValue([ChannelsStubs()]),
	getChannelById: jest.fn().mockResolvedValue(ChannelsStubs()),
	getChannelMessegesByChannelId: jest.fn().mockResolvedValue([ChannelMessagesStubs()]),
	getChannelUsersByChannelId: jest.fn().mockResolvedValue([ChannelUsersStubs()]),
	createChannel: jest.fn().mockResolvedValue(ChannelsStubs()),
})