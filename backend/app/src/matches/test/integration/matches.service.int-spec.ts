import { Test } from "@nestjs/testing";
import { User } from "@prisma/client";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/app.service"
import { CreateMatchesDto, GetMatchesStatsDto, GetMatchesDto, GetUserMatchesDto, LadderRank } from "src/matches/matches.dto";
import { MatchesService } from "src/matches/matches.service";

const usersCreate = [
	{
		displayname: 'John',
		name: 'John Doe',
		email: 'john@test.com'
	},
	{
		displayname: 'Ash',
		name: 'Ash Bee',
		email: 'ash@test.com',
	},
	{
		displayname: 'Docker',
		name: 'Docker Compose',
		email: 'docker@test.com'
	}
]

interface MatchesCreateType {
	user_index: number;
	score: number;
	opponent_index: number;
	opponent_score: number;
}

// 0					1						2
// [5, 1(1)]	[5, 1[0]]		[5, 4(1)]
// [5, 3[2]]	[1, 5(0)]		[3, 5(0)]
// [5, 4(2)]	[4, 5(2)]		[4, 5(0)]
// [1, 5(1)]

const matchesCreate: MatchesCreateType[] = [
	{
		user_index: 0,
		score: 5,
		opponent_index: 1,
		opponent_score: 1
	},
	{
		user_index: 1,
		score: 5,
		opponent_index: 0,
		opponent_score: 1,
	},
	{
		user_index: 0,
		score: 5,
		opponent_index: 2,
		opponent_score: 3,
	},
	{
		user_index: 0,
		score: 5,
		opponent_index: 2,
		opponent_score: 4,
	},
	{
		user_index: 2,
		score: 5,
		opponent_index: 1,
		opponent_score: 4
	}
]

describe('MatchesService', () => {
	let prisma: PrismaService;
	let matchesService: MatchesService;
	let users: User[] = [];
	// let matches: GetMatchesDto[] = [];
	
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		
		prisma = moduleRef.get(PrismaService);
		matchesService = moduleRef.get(MatchesService);
		await prisma.cleanDatabase();
		
		for (const user of usersCreate) {
			const created = await prisma.user.create({ data: user });
			users.push(created);
		}
	})
	
	describe('createMatch', () => {
		it('should create multiple matches', async () => {
			let created: GetMatchesDto;
			let matchDto = {} as CreateMatchesDto;
			let tmp_user_id: string;
			
			for (const match of matchesCreate) {
				matchDto.opponent_id = users[match.opponent_index].id;
				matchDto.opponent_score = match.opponent_score;
				matchDto.score = match.score;
				tmp_user_id = users[match.user_index].id;
				
				created = await matchesService.createMatch(matchDto, tmp_user_id);
				
				expect(created.users).toHaveLength(2);
				expect(created.users).toEqual(expect.arrayContaining([ 
					expect.objectContaining<Partial<GetUserMatchesDto>>({ score: matchDto.score, user_id: tmp_user_id }),
					expect.objectContaining<Partial<GetUserMatchesDto>>({ score: matchDto.opponent_score, user_id: matchDto.opponent_id })
				]))
			}
		})
	})
	
	describe('getMatches', () => {
		it('should return all matches of a user', async () => {
			let matches: GetMatchesDto[] = [];
			let tmp: GetMatchesDto[];
			
			users.forEach(async (user, index) => {
				tmp = await matchesService.getMatchesByUserId(user.id);
				expect(tmp).toEqual([...tmp].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()))
				if (index === 0) expect(tmp).toHaveLength(4);
				else expect(tmp).toHaveLength(3);
			})
		})
	})
	
	describe('getLadderRank', () => {
		it('should return match stats', async () => {
			let rank: GetMatchesStatsDto;
			
			users.forEach(async (obj, index) => {
				rank = await matchesService.getMatchesStats(obj.id);
				if (index === 0) expect(rank).toEqual<GetMatchesStatsDto>({ total: 4, rank: 'INTERMEDIATE', total_win: 3 });
				else expect(rank).toEqual<GetMatchesStatsDto>({ total: 3, rank: 'BEGINNER', total_win: 1 });
			})
		})
	})
	
	
})