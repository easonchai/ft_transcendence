import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/app.service';
import { ChatsGateway } from 'src/gateways/user.gateway';

@Module({
	providers: [UserService, PrismaService, ChatsGateway],
	controllers: [UserController],
})
export class UserModule { }
