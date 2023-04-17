import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { getToken } from "next-auth/jwt";
import { PrismaService } from "src/app.service";
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
	
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = await getToken({ req: request, raw: true });
		try {
			const session = await this.prisma.session.findUniqueOrThrow({ where: { sessionToken: token }});
			request['user_id'] = session.userId;
		} catch (e: any) {
			throw new UnauthorizedException();
		}
		return true;
	}
}

