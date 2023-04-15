import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { ChannelsService } from "./channels.service";
import { Body, Inject, Logger, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { Socket, Namespace } from 'socket.io'
import { GatewayChannelsMiddleware } from "./channels.middleware";
import { PrismaService } from "src/app.service";
import { PrismaClient } from "@prisma/client";
import { ChannelsSocketMessageDto } from "./channels.dto";
import { SocketExceptionFilter } from "src/exceptions/ws_exception.filter";
import { ValidationError } from "class-validator";

@UsePipes(new ValidationPipe({
	forbidNonWhitelisted: true,
	whitelist: true,
}))
@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
	namespace: 'channels',
})
export class ChannelsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(ChannelsGateway.name);
	constructor(
		private readonly channelsService: ChannelsService,
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	@WebSocketServer() io: Namespace;
	
	afterInit() {
		this.logger.log('Channels WebSocket gatewat initialized');
		this.io.use(GatewayChannelsMiddleware(this.channelsService, this.prisma));
	}
	
	handleConnection(client: Socket, ...args: any[]) {}
	
	handleDisconnect(client: Socket) {}
	
	@SubscribeMessage('channelMessages')
	async handleChannelMessages(client: Socket, body: ChannelsSocketMessageDto) {
		// const channelId: number = parseInt(client.handshake.query.id.toString());
		// const created = await this.channelsService.createChannelMessages(channelId, body);
		// if (created) this.io.emit('channelMessages', body); // emit or broadcast ?
		// else throw new WsException('Channel message saved failed');
		this.io.emit('channelMessages', body);
	}
}