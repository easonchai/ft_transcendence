import { Logger } from '@nestjs/common'
import { NextFunction } from 'express'
import { Socket } from 'socket.io'
import { ChannelsService } from '../channels/channels.service';
import { PrismaClient } from '@prisma/client';
import { getCookieTokenFromWs } from 'src/utils/WsCookieParser';


export const GatewayChannelsMiddleware = (channelsService: ChannelsService, prisma: PrismaClient) => async (socket: Socket, next: NextFunction) => {
	const logger = new Logger(GatewayChannelsMiddleware.name);
	let channelId: number;
	let token: string;
	
	try {
		if (!(channelId = parseInt(socket.handshake.query.id as string))) throw new Error('Channel id is required');
		token = getCookieTokenFromWs(socket.handshake.headers.cookie);
		if (!token) throw new Error('Session cookie failed');
		const session = await prisma.session.findUniqueOrThrow({ where: { sessionToken: token } })
		
		// Check if user is in the channel
		const user = await prisma.channelUsers.findUniqueOrThrow({
			where: { user_id_channel_id: { user_id: session.userId, channel_id: channelId } }
		});
		next();
	} catch (error: any) {
		next(error);
	}
}

export const GatewayRootMiddleware = (prisma: PrismaClient) => async (socket: Socket, next: NextFunction) => {
	const logger = new Logger(GatewayChannelsMiddleware.name);
	let token: string;
	
	try {
		token = getCookieTokenFromWs(socket.handshake.headers.cookie);
		if (!token) throw new Error('Session cookie failed');
		const session = await prisma.session.findUniqueOrThrow({ where: { sessionToken: token } });
		next();
	} catch (error: any) {
		next(error);
	}
}