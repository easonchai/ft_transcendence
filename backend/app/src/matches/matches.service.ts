import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/app.service';
import { CreateMatchesDto, GetMatchesStatsDto, GetMatchesDto, GetUserMatchesDto, LadderRank } from './matches.dto';

@Injectable()
export class MatchesService {
	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaClient
	) {}
	
	private async getMatches(user_id: string): Promise<GetMatchesDto[]> {
		const matches = await this.prisma.match.findMany({
			where: { 
				users: { some: { user_id: user_id } }
			},
			include: {
				users: { include: { user: true } } 
			},
			orderBy: {
				created_at: 'desc'
			}
		})
		return matches;
	}
	
	// Get
	
	async getMatchesByUserId(user_id: string): Promise<GetMatchesDto[]> {
		return await this.getMatches(user_id);
	}
	
	async getMatchesStats(user_id: string): Promise<GetMatchesStatsDto> {
		let win_count: number = 0;
		let user_match: GetUserMatchesDto;
		let res = {} as GetMatchesStatsDto;
		
		res.total = 0;
		const matches = await this.getMatches(user_id);
		for (const m of matches) {
			user_match = m.users.find((obj) => obj.user_id === user_id);
			if (!user_match) continue;
			if (user_match.score === 5) win_count++;
			res.total++;
		}
		res.total_win = win_count;
		
		if (win_count < 3) return { ...res, rank: 'BEGINNER' };
		if (win_count < 6) return { ...res, rank: 'INTERMEDIATE' };
		if (win_count < 10) return { ...res, rank: 'ADVANCE' };
		if (win_count >= 10) return { ...res, rank: 'PRO' };
	}
	
	
	
	// Create
	
	async createMatch(body: CreateMatchesDto, tmp_user_id: string = ''): Promise<GetMatchesDto> {
		const opponenet = await this.prisma.user.findUniqueOrThrow({
			where: { id: body.opponent_id }
		});
		
		const match = await this.prisma.match.create({
			data: {
				users: {
					createMany: {
						data: [
							{ score: body.score, user_id: tmp_user_id },
							{ score: body.opponent_score, user_id: body.opponent_id }
						]
					}
				}
			},
			include: {
				users: { include: { user: true } }
			}
		})
		
		return match;
	}
	
	
}
