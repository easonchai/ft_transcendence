import apiClient from "./ApiClient";
import { ChannelUserType, User } from "@prisma/client";

export interface ChannelUsersProps {
	user_id: string,
	channel_id: number,
	mute_time: Date,
	type: ChannelUserType,
	user: User
}

export interface ChannelMessagesProps {
	id: number,
	user_id: string,
	channel_id: number,
	message: string,
	created_at: Date
}

const getChannels = async () => {
	const res = await apiClient.get('/channels');
	return res.data;
}

const getChannelById = async (id: number | string) => {
	const res = await apiClient.get(`/channels/${id}`);
	return res.data;
}

const getChannelUsers = async (id: number | string): Promise<ChannelUsersProps[]> => {
	const res = await apiClient.get(`/channels/${id}/users`);
	return res.data;
}

const getChannelMessages = async (id: number | string): Promise<ChannelMessagesProps[]> => {
	const res = await apiClient.get(`/channels/${id}/messages`);
	return res.data;
}

// Post

const joinChannels = async (id: number) => {
	const res = await apiClient.post(`/channels/${id}`);
	return res.data;
}


export const channelsService = {
	getChannels,
	joinChannels,
	getChannelById,
	getChannelUsers,
	getChannelMessages
}