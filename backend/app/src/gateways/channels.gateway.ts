import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChannelsService } from '../channels/channels.service';
import {
  Inject,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { GatewayChannelsMiddleware } from './gateway.middleware';
import { PrismaService } from 'src/app.service';
import { PrismaClient } from '@prisma/client';
import { ChannelsSocketMessageDto } from '../channels/channels.dto';
import { SocketExceptionFilter } from 'src/exceptions/ws_exception.filter';
import { WsAuthGuard } from 'src/guards/auth.guards';
import { GatewayUserId } from 'src/decorators/user_id.decorators';

@UsePipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    whitelist: true,
  }),
)
@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
  namespace: 'channels',
})
export class ChannelsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChannelsGateway.name);
  constructor(
    private readonly channelsService: ChannelsService,
    @Inject(PrismaService) private readonly prisma: PrismaClient,
  ) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    this.logger.debug('Channels WebSocket gateway initialized');
    this.io.use(GatewayChannelsMiddleware(this.channelsService, this.prisma));
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.debug(`client ${client.id} connected!`);
    const channelId: number = parseInt(client.handshake.query.id as string);

    client.join(`${channelId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`client ${client.id} disconnected`);
    const channelId: number = parseInt(client.handshake.query.id as string);
    client.leave(`${channelId}`);
  }

  // console.log('client', client.rooms);						Lists client rooms
  // console.log('io', this.io.adapter.rooms);			Lists all rooms in this namespace
  // console.log('sids', this.io.adapter.sids);			Map client => {client, ...rooms}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('channelMessages')
  async handleChannelMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ChannelsSocketMessageDto,
    @GatewayUserId() auth_user_id: string,
  ) {
    const channelId: number = parseInt(client.handshake.query.id.toString());
    const created = await this.channelsService.createChannelMessages(
      channelId,
      body,
      auth_user_id,
    );
    if (created) this.io.in(`${channelId}`).emit('channelMessages', created);
    // emit or broadcast ?
    else throw new WsException('Channel message sent failed');
  }
}
