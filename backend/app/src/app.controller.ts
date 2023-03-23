import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { AppService, UserService } from './app.service';


@Controller()
export class AppController {
  constructor(
		private readonly appService: AppService,
		private readonly userService: UserService,
	) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
	
	@Get("/user")
	getUsers(): Promise<User> {
		return this.userService.getUser();
	}
}
