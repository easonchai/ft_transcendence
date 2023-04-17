import { Module } from '@nestjs/common';
import { UserBlockController } from './user-block.controller';
import { UserBlockService } from './user-block.service';

@Module({
	controllers: [UserBlockController],
	providers: [UserBlockService],
})
export class UserBlockModule { }
