import { User } from "@prisma/client";
import apiClient from "./ApiClient";

interface GetUserMatchesRresponse {
	score: number;
	match_id: number;
	user_id: string;
	user: User;
}

type LadderRank = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCE' | 'PRO';

export interface GetMatchesResponse  {
	id: number;
	users: GetUserMatchesRresponse[];
	created_at: Date;
}

export interface GetMatchStatsResponse {
	rank: LadderRank;
	total: number;
	total_win: number;
}

const getMatchHistories = async (id: string): Promise<GetMatchesResponse[]> => {
	const res = await apiClient.get(`/matches/${id}`);
	return res.data;
}

const getMatchStats = async (id: string): Promise<GetMatchStatsResponse> => {
	const res = await apiClient.get(`/matches/${id}/stats`);
	return res.data;
}

export const matchService = {
	getMatchHistories,
	getMatchStats
}