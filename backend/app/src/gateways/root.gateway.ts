import { Inject, Logger, UseFilters, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/app.service";
import { ChannelsService } from "src/channels/channels.service";
import { Socket, Namespace } from 'socket.io'
import { WsAuthGuard } from "src/guards/auth.guards";
import { GatewayUserId } from "src/decorators/user_id.decorators";
import { SocketExceptionFilter } from "src/exceptions/ws_exception.filter";
import { GatewayRootMiddleware } from "./gateway.middleware";
import { getCookieTokenFromWs } from "src/utils/WsCookieParser";

@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
	namespace: '/'
})
export class RootGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(RootGateway.name);
	private readonly connectedClients = new Map<string, string>();  // <client.id, user_id>
	
	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	@WebSocketServer() io: Namespace;
	
	afterInit(server: any) {
		this.logger.debug('Root WebSocket gateway initialized');
		this.io.use(GatewayRootMiddleware(this.prisma));
	}
	
	async handleConnection(client: Socket, ...args: any[]) {
		const token = getCookieTokenFromWs(client.handshake.headers.cookie);
		if (!token) throw new Error('Connection error');
		const session = await this.prisma.session.findUniqueOrThrow({
			where: { sessionToken: token }
		});
		this.connectedClients[client.id] = session.userId;
		this.logger.debug(`client ${client.id} connected`);
		this.io.emit('connectedClients', this.connectedClients);
	}
	
	handleDisconnect(client: Socket) {
		delete this.connectedClients[client.id];
		this.io.emit('connectedClients', this.connectedClients);
		this.logger.debug(`client ${client.id} disconnected`);
	}
}