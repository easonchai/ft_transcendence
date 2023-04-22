import { PrismaService } from "src/app.service"
import { UserService } from "../user.service";
import { FriendStatus, Prisma, User, UserBlocks, UserFriends, UserMessages } from "@prisma/client";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { HttpException } from "@nestjs/common";

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

describe('UserService', () => {
	let prisma: PrismaService;
	let userService: UserService;
	let users: User[] = [];
	
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		
		prisma = moduleRef.get(PrismaService);
		userService = moduleRef.get(UserService);
		await prisma.cleanDatabase();
		
		for (const user of usersCreate) {
			const created = await prisma.user.create({ data: user });
			users.push(created);
		}
	})
	
	describe('getUsers', () => {
		it('should return all users', async () => {
			const allUsers = await userService.getAllUser(users[0].id);
			
			expect(allUsers).toHaveLength(2);
			expect(allUsers).toEqual(expect.arrayContaining([
				expect.objectContaining<Partial<User>>({ name: users[1].name }),
				expect.objectContaining<Partial<User>>({ name: users[2].name })
			]))
		})
	})
	
	describe('getUserById', () => {
		it('should return the me detail', async () => {
			const user = await userService.getUserById(users[0].id, users[0].id);
			
			expect(user.name).toEqual(users[0].name);
		})
		
		it('should return other user detail', async () => {
			const user = await userService.getUserById(users[1].id, users[0].id);
			
			expect(user.name).toEqual(users[1].name);
		})
		
		it('should throw PrismaClientKnownRequestError if user not found', async () => {
			const errorfn = async () => {
				await userService.getUserById('nothing', users[0].id);
			}
			expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
	})
	
	// [0 -> 1], [1 -> 2]
	describe('createUserFriends', () => {
		let friended: UserFriends;
		
		it('should create some userFriends', async () => {
			friended = await userService.createUserFriends(users[1].id, users[0].id);
			
			expect(friended.status).toEqual<FriendStatus>('PENDING');
			
			friended = await userService.createUserFriends(users[2].id, users[1].id);
			
			expect(friended.status).toEqual<FriendStatus>('PENDING');
		})
	})
	
	// [0 -> 2]
	describe('createUserBlock', () => {
		let blocked: UserBlocks;
		
		it('should create some user blocks', async () => {
			blocked = await userService.createUserBlocks(users[2].id, users[0].id);
			
			expect(blocked.blocked_id).toEqual(users[2].id);
			expect(blocked.blocked_by_id).toEqual(users[0].id);
		})
		
		it('should throw HttpException due to friends cannot be blocked', async () => {
			const errorfn = async () => {
				await userService.createUserBlocks(users[0].id, users[1].id);
			}
			
			expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('createUserFriends', () => {
		it('should throw HttpException due to blocked user cannot be friends', async () => {
			const errorfn = async () => {
				await userService.createUserFriends(users[2].id, users[0].id);
			}
			
			expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('getPendingUserFriends', () => {
		it('should return userFriends with PENDING status, (accept required)', async () => {
			const userFriends = await userService.getPendingUserFriends(users[1].id);
			
			expect(userFriends).toHaveLength(1);
			expect(userFriends[0].name).toEqual(users[0].name);
		})
	})
	
	describe('getRequestUserFriends', () => {
		it('should return userFriends with PENDING status, (waiting to be accepted)', async () => {
			const userFriends = await userService.getRequestedUserFriends(users[0].id);
			
			expect(userFriends).toHaveLength(1);
			expect(userFriends[0].name).toEqual(users[1].name);
		})
	})
	
	describe('getUserBlock', () => {
		let userBlock: User[] = [];
		it('should return userBlock (who you blocked)', async () => {
			userBlock = await userService.getUserBlock(users[0].id);
			
			expect(userBlock).toHaveLength(1);
			expect(userBlock[0].name).toEqual(users[2].name);
			
			userBlock = await userService.getUserBlock(users[1].id);
			
			expect(userBlock).toHaveLength(0);
		})
	})
	
	describe('getUserBlockBy', () => {
		let userBlock: User[] = [];
		it('should return userBlock (blocked by who)', async () => {
			userBlock = await userService.getUserBlockBy(users[2].id);
			
			expect(userBlock).toHaveLength(1);
			expect(userBlock[0].name).toEqual(users[0].name);
			
			userBlock = await userService.getUserBlockBy(users[1].id);
			
			expect(userBlock).toHaveLength(0);
		})
	})
	
	describe('updateUserFriends', () => {
		let userFriend: UserFriends;
		
		it('should return updated UserFriends', async () => {
			userFriend = await userService.updateUserFriends(users[1].id, { status: 'ACCEPTED' }, users[2].id);
			
			expect(userFriend.status).toEqual<FriendStatus>('ACCEPTED');
		})
	})
	
	describe('createUserMessages', () => {
		let msg: UserMessages;
		it('should create some userMessages', async () => {
			msg = await userService.createUserMessages(users[1].id, {message: 'Sup bro'}, users[2].id);
			
			expect(msg.message).toEqual('Sup bro');
			expect(msg.receiver_id).toEqual(users[1].id);
			
			msg = await userService.createUserMessages(users[2].id, { message: 'What\'s good' }, users[1].id);
			
			expect(msg.message).toEqual('What\'s good');
			expect(msg.receiver_id).toEqual(users[2].id);
			
			msg = await userService.createUserMessages(users[0].id, { message: 'Heyo zero' }, users[1].id);
			
			expect(msg.message).toEqual('Heyo zero');
			expect(msg.receiver_id).toEqual(users[0].id);
		})
		
		it('should throw HttpException due to kena blocked', async () => {
			const errorfn = async () => {
				await userService.createUserMessages(users[0].id, { message: 'Why am I blocked ?' }, users[2].id);
			}
			
			expect(errorfn()).rejects.toThrow(HttpException);
		})
	})
	
	describe('getUserMessages', () => {
		let msg: UserMessages[];

		it('should return userMessages', async () => {
			msg = await userService.getUserMessages(users[1].id, users[2].id);
			
			expect(msg).toHaveLength(2);
			expect(msg).toEqual([...msg].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
			
			msg = await userService.getUserMessages(users[2].id, users[1].id);
			
			expect(msg).toHaveLength(2);
			expect(msg).toEqual([...msg].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
			
			msg = await userService.getUserMessages(users[0].id, users[1].id);
			
			expect(msg).toHaveLength(1);
		})
	})
	
	describe('getChatUser', () => {
		it('should return chatUsers', async () => {
			const chatUsers = await userService.getUserChats(users[1].id);
			
			expect(chatUsers).toHaveLength(2);
		})
	})
	
	describe('getAcceptedUserFriends', () => {
		let userFriends: User[] = [];
		it('should return UserFriends with ACCEPTED status', async () => {
			userFriends = await userService.getAcceptedUserFriends(users[1].id, users[0].id);
			
			expect(userFriends).toHaveLength(1);
			expect(userFriends[0].name).toEqual(users[2].name);
		})
	})
	
	describe('updateUser', () => {
		it('should return an updated user', async () => {
			const updated = await userService.updateUser({ name: 'Pepe', two_factor: true }, users[0].id);
			
			expect(updated.name).toEqual('Pepe');
			expect(updated.two_factor).toEqual(true);
		})
		
		it('should throw PrismaClientKnownRequestError due to duplicated name', async () => {
			const errorfn = async () => {
				await userService.updateUser({ name: 'Pepe', two_factor: true }, users[1].id);
			}
			
			expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
	})
	
	describe('deleteUserFriend', () => {
		it('should delete a userFriend', async () => {
			const deleted = await userService.deleteUserFriend(users[2].id, users[1].id);
			
			expect(deleted.status).toEqual<FriendStatus>('ACCEPTED');
			expect(deleted.friend_id).toEqual(users[2].id);
			expect(deleted.user_id).toEqual(users[1].id);
		})
	})
	
	describe('deleteUserBlock', () => {
		it('should throw PrismaClientKnownRequestError due to blocked user trying to unblock', async () => {
			const errorfn = async () => {
				await userService.deleteUserBlock(users[0].id, users[2].id);
			}
			
			expect(errorfn()).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		})
		
		it('should delete a userBlock', async () => {
			const userBlock = await userService.deleteUserBlock(users[2].id, users[0].id);
			
			expect(userBlock.blocked_id).toEqual(users[2].id);
			expect(userBlock.blocked_by_id).toEqual(users[0].id);
		})
	})
	
})
