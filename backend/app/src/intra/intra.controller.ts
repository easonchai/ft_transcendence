import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IntraService } from './intra.service';
import { UserId } from 'src/decorators/user_id.decorators';

@ApiTags('intra')
@Controller('intra')
export class IntraController {
  constructor(private readonly intraService: IntraService) {}

  @Get('achievements')
  @ApiOperation({ summary: 'Get intra achievements' })
  async getAchievements(@UserId() auth_user_id: string) {
    return await this.intraService.getAchievements(auth_user_id);
  }
}
