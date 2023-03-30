import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestStatus, UserFriends } from "@prisma/client";
import { UserResponseDto } from 'src/user/dto';
import { UserFriendResponseDto } from './dto';

@Injectable()
export class UserFriendService {

	constructor(private prisma: PrismaService) { }

	async getAllFriends(id: string): Promise<UserFriendResponseDto[]> {
		const friends = await this.prisma.userFriends.findMany({
			where: {
				OR: [
					{
						user_id: id,
						status: 'ACCEPTED',
					},
					{
						friend_id: id,
						status: 'ACCEPTED',
					},
				],
			},
			include: {
				user: true,
				friend: true,
			},
		})
		return friends.map(friend => new UserFriendResponseDto(friend, friend.user, friend.friend));
	}

	async getAllFriendRequests(id: string): Promise<UserFriendResponseDto[]> {
		const friends = await this.prisma.userFriends.findMany({
			where: {
				OR: [
					{
						user_id: id,
						status: 'PENDING',
					},
					{
						friend_id: id,
						status: 'PENDING',
					},
				],
			},
			include: {
				user: true,
				friend: true,
			},
		})
		return friends.map(friend => new UserFriendResponseDto(friend, friend.user, friend.friend));
	}

	async createFriendRequest(id: string, friendId: string) {
		if (id === friendId)
			throw new BadRequestException('You cannot add yourself as a friend.');
		const relation = await this.prisma.userFriends.findFirst({
			where: {
				OR: [
					{
						user_id: id,
						friend_id: friendId,
					},
					{
						user_id: friendId,
						friend_id: id,
					}
				]
			}
		});
		if (relation && (relation.status !== 'DECLINED'))
			throw new BadRequestException('A friend request has already been sent to this user.');
		const newRelation = await this.prisma.userFriends.create({ data: { user_id: id, friend_id: friendId } });
		return newRelation;
	}

	async responseFriendRequest(id: string, friendId: string, request: UserFriends) {
		if (id === friendId)
			throw new BadRequestException('You cannot add yourself as a friend.');
		const relation = await this.prisma.userFriends.findFirst({
			where: {
				OR: [
					{
						user_id: id,
						friend_id: friendId,
					},
					{
						user_id: friendId,
						friend_id: id,
					}
				]
			}
		});
		if (!relation)
			throw new BadRequestException('There is no friend request between you and the user!');
		return this.prisma.userFriends.update({}
			// where: {
				// OR: [
				// 	{
				// 		user_id: id,
				// 		friend_id: friendId,
				// 	},
				// 	{
				// 		user_id: friendId,
				// 		friend_id: id,
				// 	}
				// ]
			// }
		);
	}
}