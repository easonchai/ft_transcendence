import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/app.service";
import { MatchesService } from "src/matches/matches.service";
import { Namespace, Socket } from 'socket.io'
import { GatewayRootMiddleware } from "./gateway.middleware";
import { v4 as uuidv4, validate } from "uuid";
import { SocketExceptionFilter } from "src/exceptions/ws_exception.filter";
import { WsAuthGuard } from "src/guards/auth.guards";
import { GatewayUserId } from "src/decorators/user_id.decorators";
import { getCookieTokenFromWs } from "src/utils/WsCookieParser";
// import { PongStates } from "src/utils/PongGame";
import { PlayerPosition, initialState } from "src/utils/PongValues";
import { PongStates } from "src/utils/PongGame";

export interface MatchMessageBody {
	roomId: string;
	playerPosition: PlayerPosition;
}

@UsePipes(new ValidationPipe({
	forbidNonWhitelisted: true,
	whitelist: true,
}))
@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
	namespace: 'match',
})
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(MatchGateway.name);
	private	states: PongStates;
	constructor(
		private readonly matchesService: MatchesService,
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	@WebSocketServer() io: Namespace;
	
	afterInit(server: Socket) {
		this.logger.debug('Match websocket gateway initialized');
		this.io.use(GatewayRootMiddleware(this.prisma));
		this.states = new PongStates(this.io);
	}
	
	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.debug(`client ${client.id} connected!`);
		// const token = getCookieTokenFromWs(client.handshake.headers.cookie);
		// if (!token) throw new WsException('Unauthorized');
		// const user = await this.prisma.session.findUniqueOrThrow({ where: { sessionToken: token } });
	}
	
	async handleDisconnect(client: Socket) {
		this.logger.debug(`client ${client.id} disconnected`);
		const token = getCookieTokenFromWs(client.handshake.headers.cookie);
		if (!token) throw new WsException('Unauthorized');
		const user = await this.prisma.session.findUniqueOrThrow({ where: { sessionToken: token } });
		
		let roomId: string = null;
		client.rooms.forEach((v) => {
			if (v !== client.id) roomId = v;
		})
		if (!roomId) return;
		this.states.handleDisconnect(client, user.userId, roomId);
	}
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('newGamePressed')
	async handleNewGamePressed(@ConnectedSocket() client: Socket, @GatewayUserId() auth_user_id: string) {
		this.states.handleNewGamePressed(client, auth_user_id);
		this.logger.debug(`${client.id} joined room`);
	}
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('readyButtonPressed')
	async handleReadyButtonPressed(@ConnectedSocket() client: Socket, @MessageBody() body: MatchMessageBody, @GatewayUserId() auth_user_id: string) {
		this.states.handleReadyButtonPressed(client, body);
	}

	// @SubscribeMessage('keyPress')
	// async handleKeyPress(@ConnectedSocket() client: Socket, @MessageBody() body: KeyPressBody) {

	// }
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('game-over')
	async handleGameOver(@ConnectedSocket() client: Socket, @MessageBody() body: MatchMessageBody, @GatewayUserId() auth_user_id: string) {
		this.states.handleGameOver(client, body);
	}
}
