import { Test } from "@nestjs/testing"
import { ChannelUserType, ChannelUsers, User } from "@prisma/client";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/app.service";
import { GetChannelUsersDto, GetChannelsDto } from "src/channels/channels.dto";
import { CreateChannelDto } from "src/channels/channels.dto";
import { ChannelsService } from "src/channels/channels.service";

type TestChannelsType = GetChannelsDto & { users?: GetChannelUsersDto[] }

const usersCreate = [
	{
		displayname: 'John',
		name: 'John Doe',
		email: 'john@test.com'
	},
	{
		displayname: 'Ash',
		name: 'Ash Bee',
		email: 'ash@test.com',
	},
	{
		displayname: 'Docker',
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
	
	describe('')
	
})