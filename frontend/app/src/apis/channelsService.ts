import apiClient from "./ApiClient";

const getChannels = async () => {
	const res = await apiClient.get('/channels');
	return res.data;
}

const getChannelById = async (id: number | string) => {
	const res = await apiClient.get(`/channels/${id}`);
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
	getChannelById
}