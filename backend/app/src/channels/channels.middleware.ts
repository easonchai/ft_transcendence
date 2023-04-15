import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { Socket } from 'socket.io'
import { ChannelsService } from './channels.service';
import { WsException } from '@nestjs/websockets';
import { Prisma, PrismaClient } from '@prisma/client';


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
		if (!(token = socket.handshake.headers['authorization'])) throw new Error('Authorization header is required');
		if (!(channelId = parseInt(socket.handshake.query.id as string))) throw new Error('Channel id is required');
		// Decode authorization and get user info
		// Check if user is in the channel
		// const user = await prisma.channelUsers.findUniqueOrThrow({
		// 	where: { user_id_channel_id: { user_id: 'tmp_user_id', channel_id: 1 } }
		// });
		next();
	} catch (error: any) {
		next(error);
	}
}