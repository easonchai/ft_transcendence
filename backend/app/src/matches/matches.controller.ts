import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMatchesDto, GetMatchesStatsDto } from './matches.dto';

@ApiTags('Match')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}
	
	// Get
	
	@Get(':user_id')
	@ApiOperation({ summary: 'Get All matches with user_id' })
	@ApiOkResponse({ type: GetMatchesDto, isArray: true })
	async getMatchesByUserId(@Param('user_id') user_id: string) {
		return await this.matchesService.getMatchesByUserId(user_id);
	}
	
	@Get(':user_id/stats')
	@ApiOperation({ summary: 'Get match stats' })
	@ApiOkResponse({ type: GetMatchesStatsDto })
	async getMatchStats(@Param('user_id') user_id: string) {
		return await this.matchesService.getMatchesStats(user_id);
	}
	
}
