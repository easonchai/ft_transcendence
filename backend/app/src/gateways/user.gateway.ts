import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/app.service";
import { SocketExceptionFilter } from "src/exceptions/ws_exception.filter";
import { UserService } from "src/user/user.service";
import { Socket, Namespace } from 'socket.io'
import { GatewayChatsMiddleware } from "./gateway.middleware";
import { getCookieTokenFromWs } from "src/utils/WsCookieParser";
import { WsAuthGuard } from "src/guards/auth.guards";
import { ChatSocketMessageDto } from "src/user/user.dto";
import { GatewayUserId } from "src/decorators/user_id.decorators";
import { v4 as uuidv4 } from "uuid";

@UsePipes(new ValidationPipe({
	forbidNonWhitelisted: true,
	whitelist: true
}))
@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
	namespace: 'chats'
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(ChatsGateway.name);
	constructor(
		private readonly usersService: UserService,
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	@WebSocketServer() io: Namespace;
	
	afterInit(client: Socket) {
		this.logger.debug('Chats WebSocket gateway initialized');
		this.io.use(GatewayChatsMiddleware(this.usersService, this.prisma));
	}
	
	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.debug(`client ${client.id} connected!`);
		const token: string = getCookieTokenFromWs(client.handshake.headers.cookie);
		if (!token) throw new Error('Session cookie failed');
		const receiver_id: string = client.handshake.query.receiver_id as string;
		const session = await this.prisma.session.findUniqueOrThrow({ where: { sessionToken: token } });
		const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
		
		let roomId: string;
		roomId = `${receiver_id}${user.id}`;
		for (const [key, value] of this.io.adapter.rooms) {
			if (roomId === key) break ;
			if (`${user.id}${receiver_id}` === key) {
				roomId = key;
				break ;
			} else if (`${receiver_id}${user.id}` === key) {
				roomId = key;
				break ;
			}
		}
		
		client.join(roomId);
		client.emit('joinedRoom', { roomId: roomId });
	}
	
	handleDisconnect(client: Socket) {
		this.logger.debug(`client ${client.id} disconnected`)
		// for (const key in this.io.adapter.rooms) {
		// 	if (this.io.adapter.rooms[key] === client.id) {
		// 		client.leave(key);
		// 		break ;
		// 	}
		// }
	}
	
	@UseGuards(WsAuthGuard)
	@SubscribeMessage('chatMessages')
	async handleChatMessages(@ConnectedSocket() client: Socket, @MessageBody() body: ChatSocketMessageDto, @GatewayUserId() auth_user_id: string) {
		const receiver_id: string = client.handshake.query.receiver_id as string;
		const created = await this.usersService.createUserMessages(receiver_id, { message: body.message }, auth_user_id);
		// let roomId: string;
		// for (const [key, value] of this.io.adapter.rooms) {
		// 	if (value.has(client.id)) roomId = key;
		// }
		if (created) this.io.in(body.roomId).emit('chatMessages', created);
		else throw new WsException('User Message sent failed');
	}
}