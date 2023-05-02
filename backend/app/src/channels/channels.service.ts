import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ChannelMessages, Channels, ChannelUsers, ChannelUserType, Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/app.service';
import { CreateChannelDto, CreateChannelMessagesDto, CreateChannelUsersDto, GetChannelBannedUsers, GetChannelMessagesDto, GetChannelUsersDto, GetChannelsDto, UpdateChannelDto, UpdateChannelUserDto } from './channels.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class ChannelsService {
	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	// Get
	
	async getAllChannels(): Promise<GetChannelsDto[]> {
		const channels: Channels[] = await this.prisma.channels.findMany();
		channels.forEach(obj => { delete obj.password; })
		return channels.filter((obj) => obj.type != 'PRIVATE');
	}
	
	async getChannelById(id: number): Promise<GetChannelsDto> {
		const channel: Channels = await this.prisma.channels.findUniqueOrThrow({
			where: { id: +id },
		});
		delete channel.password;
		return channel
	}
	
	async getChannelMessegesByChannelId(id: number, auth_user_id: string = ''): Promise<GetChannelMessagesDto[]> {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id: auth_user_id },
			include: { blocked: true, blocked_by: true, channels: true }
		});
		
		if (!(user.channels.find((obj) => obj.channel_id === +id))) throw new HttpException('User is not in channel', HttpStatus.BAD_REQUEST);
		
		const user_blocked_n_blocked_by = [];
		user.blocked.forEach((obj) => {
			user_blocked_n_blocked_by.push(obj.blocked_id);
		});
		user.blocked_by.forEach((obj) => {
			user_blocked_n_blocked_by.push(obj.blocked_by_id);
		})
		
		let messages = await this.prisma.channelMessages.findMany({
			where: { channel_id: +id },
			orderBy: {
				created_at: 'asc'
			},
			include: {
				user: true
			}
		})
		
		messages = messages.filter((obj) => !user_blocked_n_blocked_by.includes(obj.user.id));
		return messages;
	}
	
	async getChannelUsersByChannelId(id: number, auth_user_id: string = ''): Promise<GetChannelUsersDto[]> {
		let res: GetChannelUsersDto[] = [];
		
		const me = await this.prisma.user.findUnique({
			where: { id: auth_user_id },
			include: { blocked: true, blocked_by: true }
		});
		
		const inChannel = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		});

		const channelUsers = await this.prisma.channelUsers.findMany({
			where: { channel_id: +id },
			include: {
				user: true
			}
		})
		
		
		for (const user of channelUsers) {
			if (me.blocked.find((obj) => obj.blocked_id === user.user_id)) continue;
			if (me.blocked_by.find((obj) => obj.blocked_by_id === user.user_id)) continue;
			res.push(user);
		}
		
		return res;
	}
	
	async getChannelBannedUsers(id: number, auth_user_id: string = ''): Promise<GetChannelBannedUsers[]> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		})
		if (channelUser.type === 'MEMBER') throw new HttpException('MEMBER is not allowed to view channel banned users', HttpStatus.BAD_REQUEST);
		
		const bannedUsers = await this.prisma.channelBannedUsers.findMany({
			where: { channel_id: +id },
			include: { user: true }
		});
		
		return bannedUsers;
	}
	
	// Post
	
	async createChannel(body: CreateChannelDto, auth_user_id: string = ''): Promise<GetChannelsDto> {
		let user: User;
		if (auth_user_id === '') {
			user = await this.prisma.user.findFirst();
		} else {
			user = await this.prisma.user.findUnique({ where: { id: auth_user_id } });
		}
		
		if (body.type == "PROTECTED" && !body.password) throw new HttpException("PROTECTED password must have password", HttpStatus.BAD_REQUEST)
		const created = await this.prisma.channels.create({
			data: {
				name: body.name,
				type: body.type,
				password: body.type == 'PROTECTED' ? await bcrypt.hash(body.password, await bcrypt.genSalt()) : undefined,
				users: {
					create: [
						{ user_id: user.id, type: ChannelUserType.OWNER }
					]
				}
			},
			include: { users: true } 
		})
		delete created.password
		return created;
	}
	
	async createChannelMessages(id: number, body: CreateChannelMessagesDto, auth_user_id: string = ''): Promise<GetChannelMessagesDto> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		});
		
		if (channelUser.mute_time > new Date()) throw new HttpException('Muted user cannot send message', HttpStatus.BAD_REQUEST);
		
		const created = await this.prisma.channelMessages.create({
			data: {
				message: body.message,
				channel: { connect: { id: +id } },
				user: { connect: { id: channelUser.user_id } }
			},
		})
		return created;
	}
	
	async createChannelUsersByJoin(id: number, body: CreateChannelUsersDto, auth_user_id: string = ''): Promise<GetChannelUsersDto> {
		const user = auth_user_id === '' ?	// Testing
			await this.prisma.user.findFirst() :
			await this.prisma.user.findUnique({ where: { id: auth_user_id } });
		
		const channel = await this.prisma.channels.findUniqueOrThrow({ where: { id: +id }, include: { banned_users: true } });
		if (channel.banned_users.find((obj) => obj.user_id === user.id)) throw new HttpException('Banned user is not allowed to join', HttpStatus.BAD_REQUEST);
		if (channel.type === 'PRIVATE') throw new HttpException('Channel is PRIVATE', HttpStatus.BAD_REQUEST);
		else if (channel.type === 'PROTECTED') {
			console.log('password', body.password);
			console.log('channel.password', channel.password);
			console.log(await bcrypt.compare(body.password, channel.password))
			if (!body.password) throw new HttpException('Channel requires password', HttpStatus.BAD_REQUEST);
			else if (!(await bcrypt.compare(body.password, channel.password))) throw new HttpException('Channel password incorrect', HttpStatus.UNAUTHORIZED);
		}
		
		const created = await this.prisma.channelUsers.create({
			data: {
				type: 'MEMBER',
				user: { connect: { id: user.id } },
				channel: { connect: { id: +id } }
			},
			include: { user: true }
		})
		return created;
	}
	
	async createChannelUserByAdd(id: number, user_id: string, auth_user_id: string = ''): Promise<GetChannelUsersDto> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		});
		if (channelUser.type === 'MEMBER') throw new HttpException('Request channel user is not Admin/Owner', HttpStatus.BAD_REQUEST);
		
		const user = await this.prisma.user.findUniqueOrThrow({ where: { id: user_id }, include: { banned_channels: true } });
		if (user.banned_channels.find((obj) => obj.channel_id === +id)) throw new HttpException('User is banned from this channel', HttpStatus.BAD_REQUEST);
		
		const created = await this.prisma.channelUsers.create({
			data: {
				type: 'MEMBER',
				user: { connect: { id: user.id } },
				channel: { connect: { id: +id } }
			},
			include: { user: true }
		})
		return created;
	}
	
	async createChannelBannedUsers(id: number, user_id: string, auth_user_id: string = ''): Promise<GetChannelBannedUsers> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		});
		const toBeBannedChannelUser = await this.prisma.channelUsers.findUnique({
			where: { user_id_channel_id: { user_id: user_id, channel_id: +id } }
		});
		
		if (channelUser.type === 'MEMBER') throw new HttpException('MEMBER cannot do ban operation', HttpStatus.BAD_REQUEST);
		if (channelUser.user_id === user_id) throw new HttpException('Cannot ban yourself', HttpStatus.BAD_REQUEST);
		if (toBeBannedChannelUser) throw new HttpException('Cannot ban existing member', HttpStatus.BAD_REQUEST);
		
		const bannedUser = await this.prisma.channelBannedUsers.create({
			data: {
				channel: { connect: { id: +id } },
				user: { connect: { id: user_id } }
			},
			include: { user: true }
		})
		return bannedUser;
	}
	
	// Patch
	
	async updateChannel(id: number, body: UpdateChannelDto, auth_user_id: string = ''): Promise<GetChannelsDto> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		})
		if (channelUser.type === 'MEMBER') throw new HttpException('User is not owner nor admin', HttpStatus.BAD_REQUEST);
		
		const updated = await this.prisma.channels.update({
			where: { id: +id },
			data: {
				name: body.name || undefined,
				password: body.password || undefined,
				type: body.type || undefined,
			}
		});
		return updated;
	}
	
	async updateChannelUser(id: number, user_id: string, body: UpdateChannelUserDto, auth_user_id: string = ''): Promise<GetChannelUsersDto> {
		const tmp_channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		});
		
		const updatingChannelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: user_id, channel_id: +id } }
		})
		
		if (tmp_channelUser.type === 'MEMBER') throw new HttpException('Member cannot alter other channel users', HttpStatus.BAD_REQUEST);
		if (updatingChannelUser.type === 'OWNER') throw new HttpException('Cannot alter OWNER channel user', HttpStatus.BAD_REQUEST);	
		if (body.type === 'OWNER') throw new HttpException('Cannot set type to OWNER', HttpStatus.BAD_REQUEST);
		
		const channelUser = await this.prisma.channelUsers.update({
			where: { user_id_channel_id: { user_id: user_id, channel_id: +id } },
			data: {
				type: body.type || undefined,
				mute_time: body.mute_time || undefined,
			},
			include: { user: true }
		})
		return channelUser;
	}
	
	// Delete
	
	async deleteChannels(id: number, auth_user_id: string = ''): Promise<GetChannelsDto> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		})
		if (channelUser.type !== 'OWNER') throw new HttpException('Must be an OWNER to delete channel', HttpStatus.BAD_REQUEST);

		await this.prisma.channels.findUniqueOrThrow({ where: { id: +id } });
		const deleted = await this.prisma.channels.delete({
			where: { id: +id }
		})
		return deleted;
	}
	
	async deleteChannelUsersByKick(id: number, user_id: string, auth_user_id: string = ''): Promise<GetChannelUsersDto> {
		const user = auth_user_id === '' ?
			await this.prisma.user.findFirst() :
			await this.prisma.user.findUniqueOrThrow({ where: { id: auth_user_id } });
		
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: user.id, channel_id: +id } }
		})
		
		const toBeDeleted = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: user_id, channel_id: +id } }
		})
		
		if (channelUser.type === 'MEMBER') throw new HttpException('User is not Admin nor Owner', HttpStatus.BAD_REQUEST);
		if (channelUser.user_id === toBeDeleted.user_id) throw new HttpException('Cannot kick yoursel', HttpStatus.BAD_REQUEST);
		if (channelUser.type === 'ADMIN' && toBeDeleted.type === 'OWNER') throw new HttpException('OWNER cannot be kicked', HttpStatus.BAD_REQUEST);

		await this.prisma.channelUsers.findUniqueOrThrow({ where: { user_id_channel_id: { user_id: toBeDeleted.user_id, channel_id: +id } } })
		const deleted = await this.prisma.channelUsers.delete({
			where: {
				user_id_channel_id: {
					user_id: toBeDeleted.user_id,
					channel_id: +id
				}
			},
			include: { user: true }
		})
		return deleted;
	}

	async deleteChannelUsersByLeave(id: number, auth_user_id: string = ''): Promise<GetChannelsDto | GetChannelUsersDto> {
		const user = auth_user_id === '' ?
			await this.prisma.user.findFirst() :
			await this.prisma.user.findUniqueOrThrow({ where: { id: auth_user_id } });
		
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: user.id, channel_id: +id } }
		})
		
		if (channelUser.type === 'OWNER') {
			await this.prisma.channels.findUniqueOrThrow({ where: { id: +id } })
			return await this.prisma.channels.delete({
				where: { id: +id }
			})
		} else {
			await this.prisma.channelUsers.findUniqueOrThrow({ where: { user_id_channel_id: { user_id: channelUser.user_id, channel_id: +id } } })
			return await this.prisma.channelUsers.delete({
				where: { user_id_channel_id: { user_id: channelUser.user_id, channel_id: +id } },
				include: { user: true }
			})
		}
	}
	
	async deleteChannelBannedUsers(id: number, user_id: string, auth_user_id: string = ''): Promise<GetChannelBannedUsers> {
		const channelUser = await this.prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: auth_user_id, channel_id: +id } }
		})
		if (channelUser.type === 'MEMBER') throw new HttpException('MEMBER cannot unban user', HttpStatus.BAD_REQUEST);
		
		await this.prisma.channelBannedUsers.findUniqueOrThrow({ where: { user_id_channel_id: { user_id: user_id, channel_id: +id } } });
		const deleted = await this.prisma.channelBannedUsers.delete({
			where: { user_id_channel_id: { user_id: user_id, channel_id: +id } },
			include: { user: true }
		})
		return deleted;
	}
}
