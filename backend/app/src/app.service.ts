import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClient } from '@prisma/client';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			errorFormat: 'pretty',
			datasources: {
				db: { url: process.env.TESTING === '1' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL }
			}
		})
	}
	
	async onModuleInit() {
		await this.$connect();
	}
	
	async enableShutdownHooks(app: INestApplication) {
		this.$on('beforeExit', async () => {
			await app.close();
		})
	}
	
	async cleanDatabase() {
		if (process.env.TESTING === '0') return ;
		const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_' && key[0] !== '$' && !key.toString().includes('Symbol('));
		return Promise.all(models.map(async (modelKey) => await this[modelKey].deleteMany({}) ));
	}
}
