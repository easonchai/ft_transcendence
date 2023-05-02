import { Match, Prisma, PrismaClient, User, Channels, ChannelType, ChannelUserType, FriendStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()

const seededUsers: User[] = [];

const seedUser = async (): Promise<void> => {
	const users: Prisma.UserCreateInput[] = Array.from({ length: 10 }, () => ({
			name: faker.name.firstName(),
			email: faker.internet.email(),
		}));
	for (const user of users) {
		const created: User = await prisma.user.create({ data: user });
		seededUsers.push(created);
	}
}

const seedMatches = async (): Promise<void> => {
	// let userMatch;
	// const matches: Prisma.MatchCreateInput[] = Array.from({ length: 2 }, (v, index) => (
	// 	{
	// 		users: {
	// 			create: userMatch = seededUsers.map((user, i) => {
	// 				if (index == 0 && i % 5 == 1) {
	// 					return {
	// 						score: faker.datatype.number(),
	// 						user: { connect: { id: seededUsers[i].id } }
	// 					};
	// 				} else if (index == 0 && i % 5 == 2) {
	// 					return {
	// 						score: faker.datatype.number(),
	// 						user: { connect: { id: seededUsers[i].id } }
	// 					};
	// 				}
	// 			})
	// 		}
	// 	}
	// ))
	// for (const match of matches) {
	// 	await prisma.match.create({ data: match });
	// }
	
	await prisma.match.create({ data: {
		users: {
			create: [
				{ user_id: seededUsers[0].id, score: faker.datatype.number() },
				{ user_id: seededUsers[1].id, score: faker.datatype.number() }
			]
		}
	} })
	

	await prisma.match.create({ data: {
		users: {
			create: [
				{ user_id: seededUsers[2].id, score: faker.datatype.number() },
				{ user_id: seededUsers[3].id, score: faker.datatype.number() }
			]
		}
	} })
}

const seedFriends = async (): Promise<void> => {
	await prisma.user.update({
		where: { id: seededUsers[0].id },
		data: {
			friends: { create: [{ friend_id: seededUsers[1].id, status: FriendStatus.ACCEPTED }] }
		}
	});
	
	await prisma.user.update({
		where: { id: seededUsers[2].id },
		data: {
			friends: { create: [{ friend_id: seededUsers[3].id, status: FriendStatus.PENDING }, { friend_id: seededUsers[4].id, status: FriendStatus.ACCEPTED }] }
		}
	});
	
	await prisma.user.update({
		where: { id: seededUsers[5].id },
		data: {
			friends: { create: [{ friend_id: seededUsers[6].id, status: FriendStatus.ACCEPTED }, { friend_id: seededUsers[7].id, status: FriendStatus.ACCEPTED }, { friend_id: seededUsers[8].id, status: FriendStatus.PENDING }] }
		}
	})
}

const seedBlocks = async (): Promise<void> => {
	await prisma.user.update({
		where: { id: seededUsers[9].id },
		data: {
			blocked: { create: { blocked_id: seededUsers[8].id } }
		}
	})
	
	await prisma.user.update({
		where: { id: seededUsers[6].id },
		data: {
			blocked: { create: [{ blocked_id: seededUsers[0].id }, { blocked_id: seededUsers[2].id }] }
		}
	})
}

const seedMessages = async(): Promise<void> => {
	await prisma.user.update({
		where: { id: seededUsers[1].id },
		data: {
			senders: { create: [
				{ message: `Hello, I am ${seededUsers[1].name}`, receiver_id: seededUsers[2].id },
			] }
		}
	})
	await prisma.user.update({
		where: { id: seededUsers[2].id },
		data: {
			senders: { create: [
				{ message: `Hello, I am ${seededUsers[2].name}`, receiver_id: seededUsers[1].id },
			] }
		}
	})
	await prisma.user.update({
		where: { id: seededUsers[2].id },
		data: {
			senders: { create: [
				{ message: `How are you ?`, receiver_id: seededUsers[1].id },
			] }
		}
	})
	await prisma.user.update({
		where: { id: seededUsers[1].id },
		data: {
			senders: { create: [
				{ message: `I am fine, thank you`, receiver_id: seededUsers[2].id },
			] }
		}
	})
}

let seededChannels: Channels[] = [];

const seedChannels = async (): Promise<void> => {
	
	let channels: Prisma.ChannelsCreateInput[] = Array.from({ length: 2 }, (v, i) => (
		{
			name: faker.name.firstName(),
			type: 'PUBLIC',
			users: { create: { type: ChannelUserType.OWNER, user_id: seededUsers[i].id } }
		}
	))
	channels.push({
		name: faker.name.firstName(),
		type:	'PRIVATE',
		users: { create: { type: ChannelUserType.OWNER, user_id: seededUsers[2].id } }
	})
	channels.push({
		name: faker.name.firstName(),
		type:	'PROTECTED',
		password:  await bcrypt.hash('1234', await bcrypt.genSalt()),
		users: { create: { type: ChannelUserType.OWNER, user_id: seededUsers[3].id } }
	})
	for (const channel of channels) {
		const created: Channels = await prisma.channels.create({ data: channel });
		seededChannels.push(created);
	}
}

const seedChannelUsers = async(): Promise<void> => {
	await prisma.channels.update({
		where: { id: seededChannels[0].id },
		data: {
			users: {
				create: [
					{ type: ChannelUserType.MEMBER, user_id: seededUsers[1].id },
					{ type: ChannelUserType.MEMBER, user_id: seededUsers[6].id },
					{ type: ChannelUserType.ADMIN, user_id: seededUsers[7].id },
				]
			}
		}
	})
}

const seedChannelBannedUsers = async(): Promise<void> => {
	await prisma.channels.update({
		where: { id: seededChannels[1].id },
		data: {
			banned_users: {
				create: [
					{ user_id: seededUsers[2].id },
					{ user_id: seededUsers[3].id },
				]
			}
		}
	})
}

const seedChannelMessages = async(): Promise<void> => {
	await prisma.channels.update({
		where: { id: seededChannels[0].id },
		data: {
			channel_messeges: {
				create: [
					{ message: "Hello, i am owner", user_id: seededUsers[0].id },
					{ message: "Admin I am", user_id: seededUsers[7].id },
					{ message: "I am member", user_id: seededUsers[6].id }
				]
			}
		}
	})
	await prisma.channels.update({
		where: { id: seededChannels[2].id },
		data: {
			channel_messeges: {
				create: [
					{ message: "Hello, i am owner", user_id: seededUsers[2].id }
				]
			}
		}
	})
}

const seedAll = async () => {
	await seedUser();
	await	seedMatches();
	await seedFriends();
	await seedBlocks();
	await seedMessages();
	await seedChannels();
	await seedChannelUsers();
	await seedChannelBannedUsers();
	await seedChannelMessages();

	prisma.$disconnect();
}

seedAll()