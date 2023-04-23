import { HttpException } from "@nestjs/common";
import { Test } from "@nestjs/testing"
import { ChannelType, ChannelUserType, ChannelUsers, Prisma, User } from "@prisma/client";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/app.service";
import { CreateChannelMessagesDto, CreateChannelUsersDto, GetChannelBannedUsers, GetChannelMessagesDto, GetChannelUsersDto, GetChannelsDto, UpdateChannelDto } from "src/channels/channels.dto";
import { CreateChannelDto } from "src/channels/channels.dto";
import { ChannelsService } from "src/channels/channels.service";

type TestChannelsType = GetChannelsDto & { users?: GetChannelUsersDto[] }

const usersCreate = [
	{
		name: 'John Doe',
		email: 'john@test.com'
	},
	{
		name: 'Ash Bee',
		email: 'ash@test.com',
	},
	{
		name: 'Docker Compose',
		email: 'docker@test.com'
	}
]

describe('ChannelsService', () => {
	let prisma: PrismaService;
	let channelsService: ChannelsService;
	let users: User[] = [];
	let channels: TestChannelsType[] = [];
	
	beforeAll(async() => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		
		prisma = moduleRef.get(PrismaService);
		channelsService = moduleRef.get(ChannelsService);
		await prisma.cleanDatabase();
		
		for (const user of usersCreate) {
			const created = await prisma.user.create({ data: user });
			users.push(created);
		}
		
		await prisma.userBlocks.create({
			data: {
				blocked_by_id: users[0].id,
				blocked_id: users[2].id
			}
		})
	});
	
	describe('createChannel', () => {
		it('should create 1 channel for each type', async () => {
			let channelDto = [] as CreateChannelDto[];
			let created = {} as TestChannelsType;
			
			channelDto = [
				{ name: 'Channel PUBLIC', type: 'PUBLIC' },
				{ name: 'Channel PROTECTED', type: 'PROTECTED', password: '1234' },
				{ name: 'Channel PRIVATE', type: 'PRIVATE' }
			];
			
			for (let i: number = 0; i < 3; i++) {
				created = await channelsService.createChannel(channelDto[i], users[i].id);
				
				expect(created.name).toEqual(channelDto[i].name);
				expect(created.type).toEqual(channelDto[i].type);
				expect(created.users).toEqual(expect.arrayContaining([
					expect.objectContaining({ user_id: users[i].id, type: ChannelUserType.OWNER }),
				]))
				delete created.users;
				channels.push(created);
			}
		})
	})
	
	describe('getAllChannels', () => {
		it('should return all channels except PRIVATE channel', async () => {
			const allChannels: GetChannelsDto[] = await channelsService.getAllChannels();
			
			expect(allChannels).toHaveLength(2);
			expect(allChannels.some((obj) => obj.type === 'PRIVATE')).toEqual(false);
		})
	})
	
	describe('getChannelById', () => {
		it('should return a channel with given channel id', async () => {
			const channel: GetChannelsDto = await channelsService.getChannelById(channels[2].id);
			
			expect(channel).not.toHaveProperty('password');
			expect(channel).toEqual(channels[2]);
		})
	})
	
	describe('createChannelUsersByJoin', () => {
		let created: GetChannelUsersDto;
		let channelUsersDto: CreateChannelUsersDto = {};
		
		beforeEach(() => {
			channelUsersDto = {};
		})
		
		it('should create a ChannelUser with type MEMBER (join with password)', async () => {
			channelUsersDto.password = '1234';
			created = await channelsService.createChannelUsersByJoin(channels[1].id, channelUsersDto, users[0].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				user_id: users[0].id,
				channel_id: channels[1].id,
				type: 'MEMBER'
			}))
		})
			
		it('should create a ChannelUser with type MEMBER (join without password)', async () => {
			created = await channelsService.createChannelUsersByJoin(channels[0].id, channelUsersDto, users[1].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				user_id: users[1].id,
				channel_id: channels[0].id,
				type: 'MEMBER'
			}))
		})
		
		it('should throw HttpException due to joining PRIVATE channel', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUsersByJoin(channels[2].id, channelUsersDto, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should throw HttpException due to joining PROTECTED channel with incorrect password', async () => {
			const errorfn = async () => {
				channelUsersDto.password = '4321';
				await channelsService.createChannelUsersByJoin(channels[1].id, channelUsersDto, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('createChannelUsersByInvite', () => {
		let created: GetChannelUsersDto;
		
		it('should create a ChannelUser with type MEMBER', async () => {
			created = await channelsService.createChannelUserByAdd(channels[0].id, users[2].id, users[0].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				user_id: users[2].id,
				channel_id: channels[0].id,
				type: 'MEMBER'
			}))
		})
		// [0, 1, 2], [1, 0], [2]
		it('should throw PrismaClientKnownRequestError due to requested user is not in channel', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUserByAdd(channels[2].id, users[0].id, users[1].id);
			}
			
			await expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
		
		it('should throw HttpException due to requested user is not Admin/Owner', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUserByAdd(channels[1].id, users[2].id, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should throw PrismaClientKnownRequestError due to duplicated channel user', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUserByAdd(channels[0].id, users[2].id, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
	})
	
	// Channels with ChannelUsers
	// [0, 1, 2], [1, 0], [2]
	describe('getChannelUsersByChannelId', () => {
		let channelUsers: GetChannelUsersDto[];
		let tmp_channel: GetChannelsDto;
		
		beforeAll(async () => {
			tmp_channel = await channelsService.createChannel({ name: 'Channel PUBLIC', type: 'PUBLIC' }, users[0].id);
			
			expect(tmp_channel).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
				name: 'Channel PUBLIC',
				type: 'PUBLIC'
			}));
		})
		
		afterAll(async () => {
			const deleted: GetChannelsDto = await channelsService.deleteChannels(tmp_channel.id, users[0].id);
			const number_of_channels = await channelsService.getAllChannels();
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
				name: 'Channel PUBLIC',
				type: 'PUBLIC'
			}))
			expect(number_of_channels).toHaveLength(2);
		})
		
		it('should return an array of channelUsers', async () => {
			channelUsers = await channelsService.getChannelUsersByChannelId(channels[0].id, users[0].id);
			
			expect(channelUsers).toHaveLength(2);
		})
		
		it('should throw PrismaClientKnownRequestError if user not in channel', async () => {
			const errorfn = async () => {
				await channelsService.getChannelUsersByChannelId(channels[1].id, users[2].id);
			}
			
			expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
	})
	
	describe('updateChannelUsers', () => {
		let channel: GetChannelsDto;
		let adminChannelUser: GetChannelUsersDto;
		
		beforeAll(async () => {
			channel = channels[0];
		})
		
		afterAll(async () => {
			adminChannelUser = await channelsService.updateChannelUser(channel.id, users[1].id, { type: 'MEMBER' }, users[0].id);
			
			expect(adminChannelUser.type).toEqual('MEMBER');
		})
		
		it('should update channelUsers', async () => {
			adminChannelUser = await channelsService.updateChannelUser(channel.id, users[1].id, { type: 'ADMIN' }, users[0].id);
			
			expect(adminChannelUser.type).toEqual('ADMIN');
		})
		
		it('should throw HttpException due to ADMIN trying to modify OWNER', async () => {
			const errorfn = async () => {
				await channelsService.updateChannelUser(channel.id, users[0].id, { type: 'MEMBER' }, users[1].id);
			}
			
			expect(errorfn).rejects.toThrow(HttpException);
		})
		
		it ('should throw HttpException due to trying to set type to OWNER', async () => {
			const errorfn = async () => {
				await channelsService.updateChannelUser(channel.id, users[2].id, { type: 'OWNER' }, users[1].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})

	describe('deleteChannelUsersByKick', () => {
		let channel: GetChannelsDto;
		let channelUser: GetChannelUsersDto;

		beforeAll(async () => {
			channel = channels[2];
			channelUser = await channelsService.createChannelUserByAdd(channel.id, users[0].id, users[2].id);
			
			expect(channelUser).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				channel_id: channel.id,
				user_id: users[0].id,
				type: 'MEMBER'
			}))
			
			channelUser = await channelsService.updateChannelUser(channel.id, users[0].id, { type: 'ADMIN' }, users[2].id);
			
			expect(channelUser.type).toEqual('ADMIN');
		})
		
		// [0, 1, 2], [1, 0], [2, 0] 
		it('should throw HttpException due to kicking OWNER is not allowed', async () => {
			const errorfn = async () => {
				await channelsService.deleteChannelUsersByKick(channel.id, users[2].id, users[0].id);
			}
			
			expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should delete a ChannelUsers', async () => {
			const deleted = await channelsService.deleteChannelUsersByKick(channel.id, users[0].id, users[2].id);
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				channel_id: channel.id,
				user_id: users[0].id,
				type: 'ADMIN'
			}))
		})
		
		it('should throw HttpException due to kicking yourself', async () => {
			const errorfn = async () => {
				await channelsService.deleteChannelUsersByKick(channel.id, users[2].id, users[2].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('deleteChannelUsersByLeave', () => {
		let channel: GetChannelsDto;
		let new_channel: GetChannelsDto;
		let channelUser: GetChannelUsersDto;
		
		beforeAll(async () => {
			channel = channels[2];
			channelUser = await channelsService.createChannelUserByAdd(channel.id, users[0].id, users[2].id);
			
			expect(channelUser).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				channel_id: channel.id,
				user_id: users[0].id,
				type: 'MEMBER'
			}))
			
			new_channel = await channelsService.createChannel({ name: 'Test', type: 'PUBLIC' }, users[0].id);
			
			expect(new_channel).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
					name: 'Test',
					type: 'PUBLIC'
			}))
		})
		
		it('should delete a ChannelUsers when a member leaves', async () => {
			const deleted = await channelsService.deleteChannelUsersByLeave(channel.id, users[0].id);
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				user_id: users[0].id,
				channel_id: channel.id,
				type: 'MEMBER',
			}))
		})
		
		it('should delete a Channel when an OWNER leaves', async () => {
			const deleted = await channelsService.deleteChannelUsersByLeave(new_channel.id, users[0].id);
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
				name: 'Test',
				type: 'PUBLIC'
			}))
		})
		
		
	})

	describe('updateChannel', () => {
		let channelDto: UpdateChannelDto = {};
		let updated: GetChannelsDto;
		let default_name: string;
		
		beforeEach(() => {
			channelDto = {};
		})
		
		it('should update and return the updated channel', async () => {
			default_name = channels[0].name;
			
			channelDto.name = 'Updated'
			updated = await channelsService.updateChannel(channels[0].id, channelDto, users[0].id);
			
			expect(updated.name).toEqual('Updated');
			
			channelDto.name = default_name;
			updated = await channelsService.updateChannel(channels[0].id, channelDto, users[0].id);
			
			expect(updated.name).toEqual(default_name);
		})
		
		it('should throw PrismaClientKnownRequestError if user is not in channel', async () => {
			const errorfn = async () => {
				await channelsService.updateChannel(channels[2].id, channelDto, users[0].id);
			}
			
			expect(errorfn).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
		
		it('should throw HttpException if user is not owner nor admin', async () => {
			const errorfn = async () => {
				await channelsService.updateChannel(channels[0].id, channelDto, users[2].id);
			}
			
			expect(errorfn).rejects.toThrow(HttpException);
		})
	})

	describe('deleteChannels', () => {
		let created: GetChannelsDto;
		let member: GetChannelUsersDto;
		
		beforeAll(async () => {
			created = await channelsService.createChannel({ name: 'test', type: 'PUBLIC' }, users[0].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
				name: 'test',
				type: 'PUBLIC'
			}))
			
			member = await channelsService.createChannelUsersByJoin(created.id, {}, users[1].id);
			
			expect(member).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				user_id: users[1].id,
				channel_id: created.id,
				type: 'MEMBER'
			}))
		})
		
		it('should delete a channel', async () => {
			const deleted = await channelsService.deleteChannels(created.id, users[0].id);
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelsDto>>({
				id: created.id,
				name: created.name
			}))
		})
		
		it('should throw HttpException due to user not OWNER', async () => {
			const errorfn = async () => {
				await channelsService.deleteChannels(channels[0].id, users[1].id);
			}
			
			expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('createChannelMessages', () => {
		let created: GetChannelMessagesDto;
		let member: User;
		
		beforeAll(async () => {
			member = users[1];
			const channelUser = await channelsService.createChannelUserByAdd(channels[2].id, member.id, users[2].id);
			
			expect(channelUser.type).toEqual('MEMBER');
			
			let date = new Date();
			date.setMinutes(date.getMinutes() + 20);
			const updatedChannelUser = await channelsService.updateChannelUser(channels[2].id, member.id, { mute_time: date }, users[2].id);
			
			expect(updatedChannelUser.mute_time).toEqual(date);
		})
		
		afterAll(async () => {
			const deleted = await channelsService.deleteChannelUsersByLeave(channels[2].id, member.id);
			
			expect((deleted as GetChannelUsersDto).user_id).toEqual(member.id);
		})
		
		it('should create some channel messages', async () => {
			created = await channelsService.createChannelMessages(channels[0].id, { message: 'hello world' }, users[0].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelMessagesDto>>({
				user_id: users[0].id,
				channel_id: channels[0].id,
				message: 'hello world',
			}))
			
			created = await channelsService.createChannelMessages(channels[0].id, { message: 'hello 42' }, users[1].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelMessagesDto>>({
				user_id: users[1].id,
				channel_id: channels[0].id,
				message: 'hello 42',
			}))
			
			created = await channelsService.createChannelMessages(channels[0].id, { message: 'hello 24' }, users[2].id);
			
			expect(created).toEqual(expect.objectContaining<Partial<GetChannelMessagesDto>>({
				user_id: users[2].id,
				channel_id: channels[0].id,
				message: 'hello 24',
			}))
		})
		
		it('should throw PrismaClientKnownRequestError due to user is not in channel', async () => {
			const errorfn = async () => {
				await channelsService.createChannelMessages(channels[2].id, { message: 'error' }, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
		
		it('should throw HttpException due to user is muted', async () => {
			const errorfn = async () => {
				await channelsService.createChannelMessages(channels[2].id, { message: 'error' }, member.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('getChannelMessages', () => {
		let channelMessages: GetChannelMessagesDto[];
		
		it('should return channels messages excluding blocked user ones', async () => {
			channelMessages = await channelsService.getChannelMessegesByChannelId(channels[0].id, users[0].id);
			
			expect(channelMessages).toHaveLength(2);
			
			channelMessages = await channelsService.getChannelMessegesByChannelId(channels[0].id, users[1].id);
			
			expect(channelMessages).toHaveLength(3);
		})
		
		it('should throw PrismaClientKnownRequestError due to user not in channel', async () => {
			const errorfn = async () => {
				await channelsService.getChannelMessegesByChannelId(channels[2].id, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('createChannelBannedUsers', () => {
		let channel: GetChannelsDto;
		let owner: User;
		let member: User;
		
		beforeAll(async () => {
			channel = channels[2];
			owner = users[2];
			member = users[1];
			
			const channelUser = await channelsService.createChannelUserByAdd(channel.id, member.id, owner.id);
			
			expect(channelUser).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				channel_id: channel.id,
				user_id: member.id,
				type: 'MEMBER'
			}))
		})
		
		it('should throw HttpException due to MEMBER trying to ban', async () => {
			const errorfn = async () => {
				await channelsService.createChannelBannedUsers(channel.id, users[0].id, member.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should create a channel banned user', async () => {
			const banned = await channelsService.createChannelBannedUsers(channel.id, users[0].id, owner.id);
			
			expect(banned).toEqual(expect.objectContaining<Partial<GetChannelBannedUsers>>({
				channel_id: channel.id,
				user_id: users[0].id
			}))
		})
		
		it('should throw HttpException due to trying to ban existing member', async () => {
			const errorfn = async () => {
				await channelsService.createChannelBannedUsers(channel.id, member.id, owner.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
	})
	
	describe('getChannelBannedUsers', () => {
		let channel: GetChannelsDto;
		let owner: User;
		let member: User;
		
		beforeAll(() => {
			channel = channels[2];
			owner = users[2];
			member = users[1];
		})
		
		it('should return an array of channel bannded users', async () => {
			const banned = await channelsService.getChannelBannedUsers(channel.id, owner.id);
			
			expect(banned).toHaveLength(1);
			expect(banned).toEqual(expect.arrayContaining([
				expect.objectContaining<Partial<GetChannelBannedUsers>>({ channel_id: channel.id, user_id: users[0].id })
			]))
		})
		
		it('should throw HttpException due to MEMBER trying to see banned users', async () => {
			const errorfn = async () => {
				await channelsService.getChannelBannedUsers(channel.id, member.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should throw HttpException due to banned user trying to join', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUsersByJoin(channel.id, {}, users[0].id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should throw HttpException due to trying to add banned user', async () => {
			const errorfn = async () => {
				await channelsService.createChannelUserByAdd(channel.id, users[0].id, owner.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('deleteChannelBannedUsers', () => {
		let channel: GetChannelsDto;
		let owner: User;
		let member: User;
		
		beforeAll(() => {
			channel = channels[2];
			owner = users[2];
			member = users[1];
		})
		
		afterAll(async () => {
			const deleted = await channelsService.deleteChannelUsersByLeave(channel.id, member.id);
					
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelUsersDto>>({
				channel_id: channel.id,
				user_id: users[1].id,
				type: 'MEMBER'
			}))
		})
		
		it('should throw HttpException due to MEMBER trying to unban', async () => {
			const errorfn = async () => {
				await channelsService.deleteChannelBannedUsers(channel.id, users[0].id, member.id);
			}
			
			await expect(errorfn()).rejects.toThrow(HttpException);
		})
		
		it('should delete a banned user', async () => {
			const deleted = await channelsService.deleteChannelBannedUsers(channel.id, users[0].id, owner.id);
			
			expect(deleted).toEqual(expect.objectContaining<Partial<GetChannelBannedUsers>>({
				channel_id: channel.id,
				user_id: users[0].id
			}))
		})
	})
	
})