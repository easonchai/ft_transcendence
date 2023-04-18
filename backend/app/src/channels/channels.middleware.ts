import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { Socket } from 'socket.io'
import { ChannelsService } from './channels.service';
import { WsException } from '@nestjs/websockets';
import { Prisma, PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { getCookieTokenFromWs } from 'src/utils/WsCookieParser';


@Injectable()
export class ChannelsMiddlewre implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		
	}
}


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