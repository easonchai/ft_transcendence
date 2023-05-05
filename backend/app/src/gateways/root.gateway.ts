import { Inject, Logger, UseFilters, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaClient, UserStatus } from "@prisma/client";
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
	private connectedClients: { client_id: string, user_id: string, status: UserStatus }[] = [];
	
	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	@WebSocketServer() io: Namespace;
	
	afterInit(server: any) {
		this.logger.debug('Root WebSocket gateway initialized');
		this.io.use(GatewayRootMiddleware(this.prisma));
	}
	
	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.debug(`${client.id} connected`);
		const token = getCookieTokenFromWs(client.handshake.headers.cookie);
		if (!token) throw new Error('Connection error');
		const session = await this.prisma.session.findUniqueOrThrow({
			where: { sessionToken: token }
		});
		this.connectedClients.push({
			client_id: client.id,
			user_id: session.userId,
			status: 'ONLINE'
		})
		this.logger.debug(`client ${client.id} connected`);
		this.io.emit('connectedClients', this.connectedClients);
	}
	
	handleDisconnect(client: Socket) {
		this.connectedClients = this.connectedClients.filter((obj) => obj.client_id !== client.id);
		this.io.emit('connectedClients', this.connectedClients);
		this.logger.debug(`client ${client.id} disconnected`);
	}
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('inGame')
	async handleInGame(@ConnectedSocket() client: Socket, @GatewayUserId() auth_user_id: string) {
		const found = this.connectedClients.find((obj) => obj.client_id === client.id);
		if (!found) return ;
		found.status = 'IN_GAME';
		this.io.emit('connectedClients', this.connectedClients);
	}
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('leaveGame')
	async handleLeaveGame(@ConnectedSocket() client: Socket, @GatewayUserId() auth_user_id: string) {
		const found = this.connectedClients.find((obj) => obj.client_id === client.id);
		if (!found) return ;
		found.status = 'ONLINE';
		this.io.emit('connectedClients', this.connectedClients);
	}
}