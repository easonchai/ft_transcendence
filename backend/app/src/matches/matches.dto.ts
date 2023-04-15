import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Match, User, UserMatch } from "@prisma/client";
import { IsInt, IsUUID } from "class-validator";

class CreatedUpdated {
	@ApiHideProperty()
	created_at: Date
	
	@ApiHideProperty()
	updated_at: Date
}

export type LadderRank = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCE' | 'PRO'

// Get

export class GetUserMatchesDto implements UserMatch {
	@ApiProperty()
	score: number;
	
	@ApiProperty()
	match_id: number;
	
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	user: User;
}

export class GetMatchesDto extends CreatedUpdated implements Match {
	@ApiProperty()
	id: number;
	
	@ApiProperty()
	users: GetUserMatchesDto[];
}

export class GetMatchesStatsDto {
	@ApiProperty()
	rank: LadderRank;
	
	@ApiProperty()
	total: number;
	
	@ApiProperty()
	total_win: number;
}

// Create

export class CreateMatchesDto {
	@IsUUID('all')
	opponent_id: string;	// opponent
	
	@IsInt()
	opponent_score: number;
	
	@IsInt()
	score: number;
}

