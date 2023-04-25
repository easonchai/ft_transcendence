import apiClient from "./ApiClient";
import { ChannelType, ChannelUserType, Channels, User } from "@prisma/client";

export interface ChannelUsersResponse {
	user_id: string,
	channel_id: number,
	mute_time: Date,
	type: ChannelUserType,
	user: User
}

export interface ChannelMessagesResponse {
	id: number,
	user_id: string,
	channel_id: number,
	message: string,
	created_at: Date
}

export interface ChannelBannedResponse {
	user_id: string,
	channel_id: number,
	user: User
}

export interface EditChannelUsersRequest {
	type?: ChannelUserType
	mute_time?: Date
}

export interface CreateChannelsRequest{
	name: string;
	password?: string;
	type: ChannelType
}

export interface PasswordJoinRequest {
	password?: string
}

const getChannels = async (): Promise<Channels[]> => {
	const res = await apiClient.get('/channels');
	return res.data;
}

const getChannelById = async (id: number | string) => {
	const res = await apiClient.get(`/channels/${id}`);
	return res.data;
}

const getChannelUsers = async (id: number | string): Promise<ChannelUsersResponse[]> => {
	const res = await apiClient.get(`/channels/${id}/users`);
	return res.data;
}

const getChannelMessages = async (id: number | string): Promise<ChannelMessagesResponse[]> => {
	const res = await apiClient.get(`/channels/${id}/messages`);
	return res.data;
}

const getChannelBanned = async (id: number | string): Promise<ChannelBannedResponse[]> => {
	const res = await apiClient.get(`/channels/${id}/banned`);
	return res.data;
}

// const getUsers = async (): Promise<User[]> => {
// }

// Post

const joinChannels = async (id: number | string, body: PasswordJoinRequest = {}): Promise<ChannelUsersResponse> => {
	const res = await apiClient.post(`/channels/${id}`, body);
	return res.data;
}

const createChannels = async (body: CreateChannelsRequest): Promise<Channels> => {
	const res = await apiClient.post(`/channels`, body);
	return res.data;
}

const banChannelUser = async (id: number | string, user_id: string): Promise<ChannelBannedResponse> => {
	const res = await apiClient.post(`/channels/${id}/banned/${user_id}`);
	return res.data;
}

const inviteChannelUser = async (id: number | string, user_id: string): Promise<ChannelUsersResponse> => {
	const res = await apiClient.post(`/channels/${id}/add/${user_id}`);
	return res.data;
}

// Patch

const editChannelUser = async (id: number | string, user_id: string, body: EditChannelUsersRequest): Promise<ChannelUsersResponse> => {
	const res = await apiClient.patch(`/channels/${id}/user/${user_id}`, body);
	return res.data;
}


// Delete

const leaveChannels = async (id: number | string) => {
	const res = await apiClient.delete(`/channels/${id}`);
	return res.data;
}

const kickChannelUser = async (id: number | string, user_id: string): Promise<ChannelUsersResponse> => {
	const res = await apiClient.delete(`/channels/${id}/user/${user_id}`);
	return res.data;
}

const unbanChannelUser = async (id: number | string, user_id: string): Promise<ChannelBannedResponse> => {
	const res = await apiClient.delete(`/channels/${id}/banned/${user_id}`);
	return res.data;
}

export const channelsService = {
	getChannels,
	joinChannels,
	getChannelById,
	getChannelUsers,
	getChannelMessages,
	editChannelUser,
	kickChannelUser,
	getChannelBanned,
	unbanChannelUser,
	banChannelUser,
	inviteChannelUser,
	leaveChannels,
	createChannels
}