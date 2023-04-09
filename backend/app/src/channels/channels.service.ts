import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ChannelMessages, Channels, ChannelUsers, ChannelUserType, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/app.service';
import { createChannelDto, createChannelMessagesDto, updateChannelDto } from './channels.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
const prisma = new PrismaClient();

@Injectable()
export class ChannelsService {
	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	// Get
	
	async getAllChannels(): Promise<Channels[]> {
		const channels: Channels[] = await this.prisma.channels.findMany();
		channels.forEach(obj => { delete obj.password; })
		return channels;
	}
	
	async getChannelById(id: number): Promise<Channels> {
		const channel: Channels = await this.prisma.channels.findFirstOrThrow({
			where: { id: +id },
			include: {
				users: {
					where: { type: ChannelUserType.OWNER },
					include: {
						user: true
					}
				}
			}
		});
		delete channel.password;
		return channel
	}
	
	async getMessegesByChannelId(id: number): Promise<ChannelMessages[]> {
		return await this.prisma.channelMessages.findMany({
			where: { channel_id: +id },
			orderBy: {
				created_at: 'desc'
			}
		})
	}
	
	async getUsersByChannelId(id: number): Promise<ChannelUsers[]> {
		return await prisma.channelUsers.findMany({
			where: { channel_id: +id },
			include: {
				user: true
			}
		})
	}
	
	// Post
	
	async createChannel(body: createChannelDto): Promise<Channels> {
		if (body.type == "PROTECTED" && !body.password) throw new HttpException("Private ", HttpStatus.BAD_REQUEST)
		const user = await prisma.user.findFirst();
		const created = await prisma.channels.create({
			data: {
				name: body.name,
				type: body.type,
				password: body.password,
				// id: 1,		// Test PrismaClientExceptionFilter
				users: {
					create: [
						{ user_id: user.id, type: ChannelUserType.OWNER }
					]
				}
			}
		})
		return created;
	}
	
	async createChannelMessages(body: createChannelMessagesDto): Promise<ChannelMessages> {
		const user = await prisma.user.findFirst();
		// prisma create is not returning correct value
		const created = await prisma.channelMessages.create({
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
	
	// Patch
	
	async updateChannel(id: number, body: updateChannelDto): Promise<Channels> {
		const first_user = await prisma.user.findUnique({ 
			where: { id: 'clg7t7h1h00020hu6c1bp9jog' },
			include: {
				channels: true
			}
		});
		const isOwner = first_user.channels.find((obj) => obj.channel_id === +id);
		if (!isOwner)
			throw new HttpException('User is not owner nor admin', HttpStatus.BAD_REQUEST);
		await prisma.user.findFirstOrThrow({		// Throw if not owner/admin
			where: {
				id: first_user.id,
				channels: {
					every: { type: "OWNER" || "ADMIN", channel_id: +id }
				}
			}
		});
		const updated = await prisma.channels.update({
			where: { id: +id },
			data: {
				name: body.name || undefined,
				password: body.password || undefined,
				type: body.type || undefined,
			}
		});
		return updated;
	}
	
	
	
}
