import apiClient from "./ApiClient";

const getChannels = async () => {
	const res = await apiClient.get('/channels');
	return res.data;
}

const joinChannels = async (id: number) => {
	const res = await apiClient.post(`/channels/${id}`);
	return res.data;
}

export const channelsService = {
	getChannels,
	joinChannels
}