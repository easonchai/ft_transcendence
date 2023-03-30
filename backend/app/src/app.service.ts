import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client'
const prisma = new PrismaClient()

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect();
	}
	
	async enableShutdownHooks(app: INestApplication) {
		this.$on('beforeExit', async () => {
			await app.close();
		})
	}
}

// @Injectable()
// export class UserService {
// 	constructor(private prisma: PrismaService) {}
	
// 	async getUser() {
// 		return await this.prisma.user.findFirst();
// 	}
// }
