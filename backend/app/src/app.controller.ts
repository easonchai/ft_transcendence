import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(
		private readonly appService: AppService,
	) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
