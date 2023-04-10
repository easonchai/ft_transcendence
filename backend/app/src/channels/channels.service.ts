import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ChannelMessages, Channels, ChannelUsers, ChannelUserType, Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/app.service';
import { CreateChannelDto, CreateChannelMessagesDto, CreateChannelUsersDto, GetChannelMessagesDto, GetChannelUsersDto, GetChannelsDto, UpdateChannelDto } from './channels.dto';
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
	
	async getChannelMessegesByChannelId(id: number): Promise<GetChannelMessagesDto[]> {
		const user = await this.prisma.user.findFirst({ include: { blocked: true, blocked_by: true } });	// Temporary
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
				created_at: 'desc'
			},
			include: {
				user: true
			}
		})
		
		messages = messages.filter((obj) => !user_blocked_n_blocked_by.includes(obj.user.id));
		return messages;
	}
	
	async getChannelUsersByChannelId(id: number): Promise<GetChannelUsersDto[]> {
		return await this.prisma.channelUsers.findMany({
			where: { channel_id: +id },
			include: {
				user: true
			}
		})
	}
	
	// Post
	
	async createChannel(body: CreateChannelDto, user_id: string = ''): Promise<GetChannelsDto> {
		let user: User;
		if (user_id === '') {
			user = await this.prisma.user.findFirst();
		} else {
			user = await this.prisma.user.findUnique({ where: { id: user_id } });
		}
		
		if (body.type == "PROTECTED" && !body.password) throw new HttpException("PROTECTED password must have password", HttpStatus.BAD_REQUEST)
		const created = await this.prisma.channels.create({
			data: {
				name: body.name,
				type: body.type,
				password: await bcrypt.hash(body.password, await bcrypt.genSalt()),
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
	
	async createChannelMessages(body: CreateChannelMessagesDto): Promise<GetChannelMessagesDto> {
		const user = await this.prisma.user.findFirst();	// Temporary
		// prisma create is not returning correct value
		const created = await this.prisma.channelMessages.create({
			data: {
				message: body.message,
				channel: {
					connect: {
						id: body.channel_id
					}
				},
				user: {
					connect: {
						id: user.id
					}
				}
			},
		})
		return created;
	}
	
	async createChannelUsersByJoin(id: number, body: CreateChannelUsersDto, user_id: string = ''): Promise<GetChannelUsersDto> {
		const user = user_id === '' ?	// Testing
			await this.prisma.user.findFirst() :
			await this.prisma.user.findUnique({ where: { id: user_id } });
		
		const channel = await this.prisma.channels.findUnique({ where: { id: +id } });
		if (channel.type === 'PRIVATE') throw new HttpException('Channel is PRIVATE', HttpStatus.BAD_REQUEST);
		else if (channel.type === 'PROTECTED') {
			if (!body.password) throw new HttpException('Channel requires password', HttpStatus.BAD_REQUEST);
			else if (!(await bcrypt.compare(body.password, channel.password))) throw new HttpException('Channel password incorrect', HttpStatus.UNAUTHORIZED);
		}
		
		const created = await this.prisma.channelUsers.create({
			data: {
				type: 'MEMBER',
				user: {
					connect: { id: user.id }
				},
				channel: {
					connect: { id: +id }
				}
			},
			include: { user: true }
		})
		return created;
	}
	
	async createChannelUserByAdd(id: number, user_id: string): Promise<GetChannelUsersDto> {
		const user = await this.prisma.user.findUnique({ where: { id: user_id } });
		const created = await this.prisma.channelUsers.create({
			data: {
				type: 'MEMBER',
				user: {
					connect: { id: user.id }
				},
				channel: {
					connect: { id: +id }
				}
			},
			include: { user: true }
		})
	}
	
	// Patch
	
	async updateChannel(id: number, body: UpdateChannelDto): Promise<GetChannelsDto> {
		const user = await this.prisma.user.findFirst({ include: { channels: true } });	// Temporary
		
		const channelUser = user.channels.find((obj) => obj.channel_id === +id && (obj.type === 'OWNER' || obj.type === 'ADMIN'));
		if (channelUser)
			throw new HttpException('User is not owner nor admin', HttpStatus.BAD_REQUEST);
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
	
	// Delete
	
	async deleteChannelUsers(id: number): Promise<void> {
		const user = await this.prisma.user.findFirst({ include: { channels: true } });	// Temporary
		
		const channelUser = user.channels.find((obj) => obj.channel_id === +id);
		if (!channelUser) // User does not exist in channel
			throw new HttpException('User is not in channel', HttpStatus.BAD_REQUEST);
		if (channelUser.type === 'OWNER') {
			await this.prisma.channels.delete({
				where: { id: +id }
			})
		} else {
			await this.prisma.channelUsers.delete({
				where: {
					user_id_channel_id: {
						user_id: user.id,
						channel_id: +id
					}
				}
			})
		}
	}
}
