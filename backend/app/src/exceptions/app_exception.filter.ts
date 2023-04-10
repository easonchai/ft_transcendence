import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
	
	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		let body: { statusCode?: number, message?: string } = {};
		
		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(exception.code, exception.name);
			body.message = `${exception.code} ${exception.message}`;

			switch (exception.code) {
				case 'P2002': {
					body.statusCode = HttpStatus.CONFLICT;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
				}
				case 'P2025': {
					body.statusCode = HttpStatus.NOT_FOUND;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
				}
				default:
					body.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
			}
		} else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
			if (exception.message.includes('Channels_password_constraint')) {
				body.message = 'Channes.password cannot be empty if type is PROTECTED';
			} else {
				body.message = exception.message;
			}
			body.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
		} else if (exception instanceof HttpException) {
			body.statusCode = exception.getStatus();
			body.message = exception.message;
			httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
		}
	}
}
