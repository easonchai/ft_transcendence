import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Response,
  StreamableFile,
} from '@nestjs/common';
import {
  ChannelUsers,
  Channels,
  TwoFactorStatus,
  User,
  UserBlocks,
  UserFriends,
  UserMessages,
} from '@prisma/client';
import { PrismaService } from 'src/app.service';
import path, { join } from 'path';
import {
  CreateChannelMessagesDto,
  GetChannelUsersDto,
} from 'src/channels/channels.dto';
import {
  Complete2FASetupDto,
  GetUserMessages,
  UpdateUserDto,
  UpdateUserFriendsDto,
} from './user.dto';
import { createReadStream, unlink } from 'fs';
import * as speakeasy from 'speakeasy';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Get

  async getAllUser(auth_user_id: string): Promise<User[]> {
    const friends: string[] = [];
    const blocks: string[] = [];
    const myFriends = await this.prisma.userFriends.findMany({
      where: { user_id: auth_user_id },
      include: { friend: true },
    });
    const myFriendOf = await this.prisma.userFriends.findMany({
      where: { friend_id: auth_user_id },
      include: { user: true },
    });
    myFriends.forEach((obj) => friends.push(obj.friend.id));
    myFriendOf.forEach((obj) => friends.push(obj.user.id));

    const myBlocks = await this.prisma.userBlocks.findMany({
      where: { blocked_by_id: auth_user_id },
      include: { blocked: true },
    });
    const myBlockBy = await this.prisma.userBlocks.findMany({
      where: { blocked_id: auth_user_id },
      include: { blocked_by: true },
    });
    myBlocks.forEach((obj) => blocks.push(obj.blocked.id));
    myBlockBy.forEach((obj) => blocks.push(obj.blocked_by.id));

    // Hide friends and blocked and meself

    let users = await this.prisma.user.findMany();
    users = users.filter(
      (obj) =>
        !friends.includes(obj.id) &&
        !blocks.includes(obj.id) &&
        obj.id !== auth_user_id,
    );

    return users;
  }

  async getUserById(user_id: string, auth_user_id: string): Promise<User> {
    const me = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth_user_id },
      include: { blocked: true, blocked_by: true },
    });
    if (me.blocked.find((obj) => obj.blocked_id === user_id))
      throw new HttpException('User is blocked', HttpStatus.BAD_REQUEST);
    if (me.blocked_by.find((obj) => obj.blocked_by_id === user_id))
      throw new HttpException('User is blocked', HttpStatus.BAD_REQUEST);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: user_id },
    });
    return user;
  }

  async getAcceptedUserFriends(
    user_id: string,
    auth_user_id: string,
  ): Promise<User[]> {
    const me = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth_user_id },
      include: { blocked: true, blocked_by: true },
    });
    if (me.blocked.find((obj) => obj.blocked_id === user_id))
      throw new HttpException('User is blocked', HttpStatus.BAD_REQUEST);
    if (me.blocked_by.find((obj) => obj.blocked_by_id === user_id))
      throw new HttpException('User is blocked', HttpStatus.BAD_REQUEST);

    let friends: User[] = [];
    const myFriends = await this.prisma.userFriends.findMany({
      where: { user_id: user_id, status: 'ACCEPTED' },
      include: { friend: true },
    });
    const myFriendsOf = await this.prisma.userFriends.findMany({
      where: { friend_id: user_id, status: 'ACCEPTED' },
      include: { user: true },
    });
    myFriends.forEach((obj) => friends.push(obj.friend));
    myFriendsOf.forEach((obj) => friends.push(obj.user));

    friends = friends.filter((obj) => {
      for (const a of me.blocked) {
        if (a.blocked_id === obj.id) return false;
      }
      for (const a of me.blocked_by) {
        if (a.blocked_by_id === obj.id) return false;
      }
      return true;
    });

    return friends;
  }

  async getPendingUserFriends(auth_user_id: string): Promise<User[]> {
    const friends: User[] = [];

    const myFriendsOf = await this.prisma.userFriends.findMany({
      where: { friend_id: auth_user_id, status: 'PENDING' },
      include: { user: true },
    });
    myFriendsOf.forEach((obj) => friends.push(obj.user));
    return friends;
  }

  async getRequestedUserFriends(auth_user_id: string): Promise<User[]> {
    const friends: User[] = [];

    const myFriends = await this.prisma.userFriends.findMany({
      where: { user_id: auth_user_id, status: 'PENDING' },
      include: { friend: true },
    });
    myFriends.forEach((obj) => friends.push(obj.friend));
    return friends;
  }

  async getUserBlock(auth_user_id: string): Promise<User[]> {
    const blocks: User[] = [];
    const myBlock = await this.prisma.userBlocks.findMany({
      where: { blocked_by_id: auth_user_id },
      include: { blocked: true },
    });
    myBlock.forEach((obj) => blocks.push(obj.blocked));
    return blocks;
  }

  async getUserBlockBy(auth_user_id: string): Promise<User[]> {
    const blockby: User[] = [];
    const myblockby = await this.prisma.userBlocks.findMany({
      where: { blocked_id: auth_user_id },
      include: { blocked_by: true },
    });
    myblockby.forEach((obj) => blockby.push(obj.blocked_by));
    return blockby;
  }

  async getUserMessages(
    user_id: string,
    auth_user_id: string,
  ): Promise<UserMessages[]> {
    let messages: UserMessages[] = [];
    const senderMsg = await this.prisma.userMessages.findMany({
      where: { sender_id: auth_user_id, receiver_id: user_id },
    });
    const receiverMsg = await this.prisma.userMessages.findMany({
      where: { sender_id: user_id, receiver_id: auth_user_id },
    });
    messages = [...senderMsg, ...receiverMsg];
    messages.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    return messages;
  }

  async setup2fa(auth_user_id: string) {
    const secret = speakeasy.generateSecret({ name: 'ft_transcendence' });
    await this.prisma.user.update({
      where: {
        id: auth_user_id,
      },
      data: {
        two_factor_code: secret.base32,
      },
    });
    return secret;
  }

  private async verify2fa(auth_user_id: string, data: Complete2FASetupDto) {
    const { code } = data;

    /**
     * Now we verify the code.
     *
     * Only if its verified, we will actually set the user's 2FA as enabled
     */
    const { two_factor_code } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: auth_user_id,
      },
      select: {
        two_factor_code: true,
      },
    });

    return speakeasy.totp.verify({
      secret: two_factor_code,
      encoding: 'base32',
      token: code,
    });
  }

  private async attach2faSession(auth_user_id: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        userId: auth_user_id,
      },
    });
    if (session) {
      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          twoFaStatus: TwoFactorStatus.PASSED,
        },
      });
    }
  }

  private async detach2faSession(auth_user_id: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        userId: auth_user_id,
      },
    });
    if (session) {
      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          twoFaStatus: null,
        },
      });
    }
  }

  async verify2faCode(auth_user_id: string, data: Complete2FASetupDto) {
    const verified = await this.verify2fa(auth_user_id, data);
    if (verified) {
      await this.attach2faSession(auth_user_id);
      return true;
    } else {
      throw new HttpException('Invalid 2FA code', HttpStatus.BAD_REQUEST);
    }
  }

  async disable2faCode(auth_user_id: string, data: Complete2FASetupDto) {
    const verified = await this.verify2fa(auth_user_id, data);
    if (verified) {
      await this.prisma.user.update({
        where: {
          id: auth_user_id,
        },
        data: {
          two_factor: false,
          two_factor_code: null,
        },
      });
      await this.detach2faSession(auth_user_id);
    } else {
      throw new HttpException('Invalid 2FA code', HttpStatus.BAD_REQUEST);
    }
  }

  async completeSetup2fa(auth_user_id: string, data: Complete2FASetupDto) {
    const verified = await this.verify2fa(auth_user_id, data);

    if (verified) {
      await this.prisma.user.update({
        where: {
          id: auth_user_id,
        },
        data: {
          two_factor: true,
        },
      });
      await this.attach2faSession(auth_user_id);
    } else {
      throw new HttpException(
        'Unable to setup 2FA! Code is incorrect.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserChats(auth_user_id: string): Promise<User[]> {
    let chatUsers: User[] = [];
    let ids: string[] = [];

    const userMessagesReceiver = await this.prisma.userMessages.findMany({
      where: { receiver_id: auth_user_id },
    });
    const userMessagesSender = await this.prisma.userMessages.findMany({
      where: { sender_id: auth_user_id },
    });

    userMessagesReceiver.forEach((obj) => ids.push(obj.sender_id));
    userMessagesSender.forEach((obj) => ids.push(obj.receiver_id));

    ids = ids.filter((obj, index, arr) => arr.indexOf(obj) === index);
    chatUsers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return chatUsers;
  }

  async getUserChannels(auth_user_id: string): Promise<Channels[]> {
    const channels: Channels[] = [];
    const channelsUsers = await this.prisma.channelUsers.findMany({
      where: { user_id: auth_user_id },
      include: { channel: true },
    });
    channelsUsers.forEach((obj) => channels.push(obj.channel));
    return channels;
  }

  async getUserImage(
    user_id: string,
    auth_user_id: string,
  ): Promise<StreamableFile> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user_id,
      },
    });
		const file = createReadStream(join(`${process.cwd()}`, user.image));
    return new StreamableFile(file);
  }

  // Create

  async createUserFriends(
    user_id: string,
    auth_user_id: string,
  ): Promise<UserFriends> {
    if (user_id === auth_user_id)
      throw new HttpException(
        'Cannot be friend with yourself',
        HttpStatus.BAD_REQUEST,
      );

    const tba = await this.prisma.user.findUniqueOrThrow({
      where: { id: user_id },
      include: { blocked: true, blocked_by: true },
    });
    tba.blocked.forEach((obj) => {
      if (obj.blocked_id === auth_user_id)
        throw new HttpException(
          'User is blocked cannot be friends',
          HttpStatus.BAD_REQUEST,
        );
    });
    tba.blocked_by.forEach((obj) => {
      if (obj.blocked_by_id === auth_user_id)
        throw new HttpException(
          'User is blocked cannot be friends',
          HttpStatus.BAD_REQUEST,
        );
    });

    const created = await this.prisma.userFriends.create({
      data: {
        user: { connect: { id: auth_user_id } },
        friend: { connect: { id: tba.id } },
        status: 'PENDING',
      },
    });
    return created;
  }

  async createUserBlocks(
    user_id: string,
    auth_user_id: string,
  ): Promise<UserBlocks> {
    if (user_id === auth_user_id)
      throw new HttpException('Cannot block yourself', HttpStatus.BAD_REQUEST);

    const tba = await this.prisma.user.findUniqueOrThrow({
      where: { id: user_id },
      include: { friends: true, friend_of: true },
    });
    tba.friends.forEach((obj) => {
      if (obj.friend_id === auth_user_id)
        throw new HttpException(
          'Friends cannot be blocked',
          HttpStatus.BAD_REQUEST,
        );
    });
    tba.friend_of.forEach((obj) => {
      if (obj.user_id === auth_user_id)
        throw new HttpException(
          'Friends cannot be blocked',
          HttpStatus.BAD_REQUEST,
        );
    });

    const created = await this.prisma.userBlocks.create({
      data: {
        blocked_by: { connect: { id: auth_user_id } },
        blocked: { connect: { id: tba.id } },
      },
    });
    return created;
  }

  async createUserMessages(
    user_id: string,
    body: CreateChannelMessagesDto,
    auth_user_id: string,
  ): Promise<UserMessages> {
    if (user_id === auth_user_id)
      throw new HttpException(
        'Cannot talk to yourself',
        HttpStatus.BAD_REQUEST,
      );

    const isBlock = await this.prisma.userBlocks.findFirst({
      where: {
        OR: [
          { blocked_by_id: auth_user_id, blocked_id: user_id },
          { blocked_by_id: user_id, blocked_id: auth_user_id },
        ],
      },
    });
    if (isBlock)
      throw new HttpException(
        'Cannot chat with blocked user',
        HttpStatus.BAD_REQUEST,
      );

    const created = await this.prisma.userMessages.create({
      data: {
        sender: { connect: { id: auth_user_id } },
        receiver: { connect: { id: user_id } },
        message: body.message,
      },
    });
    return created;
  }

  // UpdateUser

  async updateUser(body: UpdateUserDto, auth_user_id: string): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: auth_user_id },
      data: {
        name: body.name,
        two_factor: body.two_factor,
      },
    });
    return updated;
  }

  async updateUserFriends(
    user_id: string,
    body: UpdateUserFriendsDto,
    auth_user_id: string,
  ): Promise<UserFriends> {
    const tba = await this.prisma.user.findUniqueOrThrow({
      where: { id: user_id },
    });
    const updated = await this.prisma.userFriends.update({
      where: {
        user_id_friend_id: { user_id: user_id, friend_id: auth_user_id },
      },
      data: { status: body.status },
    });
    return updated;
  }

  async updateUserImage(path: string, auth_user_id: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth_user_id },
    });
    const updated = await this.prisma.user.update({
      where: { id: auth_user_id },
      data: {
        image: path,
      },
    });
    return updated;
  }

  // Delete

  async deleteUserFriend(
    user_id: string,
    auth_user_id: string,
  ): Promise<UserFriends> {
    let deleted: UserFriends;

    try {
      deleted = await this.prisma.userFriends.delete({
        where: {
          user_id_friend_id: { user_id: auth_user_id, friend_id: user_id },
        },
      });
    } catch (e: any) {
      deleted = await this.prisma.userFriends.delete({
        where: {
          user_id_friend_id: { user_id: user_id, friend_id: auth_user_id },
        },
      });
    }
    return deleted;
  }

  async deleteUserBlock(
    user_id: string,
    auth_user_id: string,
  ): Promise<UserBlocks> {
    const deleted: UserBlocks = await this.prisma.userBlocks.delete({
      where: {
        blocked_by_id_blocked_id: {
          blocked_by_id: auth_user_id,
          blocked_id: user_id,
        },
      },
    });

    return deleted;
  }
}
