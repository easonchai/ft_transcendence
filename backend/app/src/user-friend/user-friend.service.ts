import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestStatus, Prisma, UserFriends } from "@prisma/client";
import { UserResponseDto } from 'src/user/dto';
import { UserFriendDto, UserFriendResponseDto } from './dto';

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
		return friends.map(friend => new UserFriendResponseDto(friend, friend.user, friend.friend, id));
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
		return friends.map(friend => new UserFriendResponseDto(friend, friend.user, friend.friend, id));
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
		if (relation && (relation.status === 'DECLINED'))
			return this.updateFriendRequest(id, friendId, 'PENDING');
		const newRelation = await this.prisma.userFriends.create({ data: { user_id: id, friend_id: friendId } });
		return newRelation;
	}

	async updateFriendRequest(id: string, friendId: string, status: FriendRequestStatus) {
		if (id === friendId)
			throw new BadRequestException('You cannot add yourself as a friend.');
		const where: Prisma.UserFriendsWhereUniqueInput = {
			user_id_friend_id: {
				user_id: friendId,
				friend_id: id,
			},
		};
		const relation = await this.prisma.userFriends.findFirst({
			where: {
				OR: [
					{
						user_id: friendId,
						friend_id: id,
						status: 'PENDING'
					},
					{
						user_id: friendId,
						friend_id: id,
						status: 'DECLINED'
					},
					{
						user_id: id,
						friend_id: friendId,
						status: 'DECLINED'
					}
				]
			},
		});
		if (!relation)
			throw new BadRequestException('There is no pending friend request between you and the user!');


		const updatedStatus = await this.prisma.userFriends.update({
			where,
			data: {
				status: status,
			},
		});
		return (new UserFriendResponseDto(updatedStatus, null, null, id));
	}

	async acceptFriendRequest(id: string, friendId: string) {
		return this.updateFriendRequest(id, friendId, 'ACCEPTED');
	}

	async declineFriendRequest(id: string, friendId: string) {
		return this.updateFriendRequest(id, friendId, 'DECLINED');
	}

	async deleteFriend(id: string, friendId: string) {
		const relation = await this.prisma.userFriends.findFirst({
			where: {
				OR: [
					{
						user_id: friendId,
						friend_id: id,
						status: 'ACCEPTED'
					},
					{
						user_id: id,
						friend_id: friendId,
						status: 'ACCEPTED'
					}
				]
			},
		});
		if (!relation)
			throw new BadRequestException('No existing friendship');
		const where: Prisma.UserFriendsWhereUniqueInput = {
			user_id_friend_id: {
				user_id: friendId,
				friend_id: id,
			},
		};
		return this.prisma.userFriends.delete({
			where,
		})
	}
}