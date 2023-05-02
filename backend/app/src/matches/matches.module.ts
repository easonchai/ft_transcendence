import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaService } from 'src/app.service';
import { MatchGateway } from 'src/gateways/match.gateway';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService, MatchGateway]
})
export class MatchesModule {}
