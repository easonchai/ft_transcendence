import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
	
	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		let body: { statusCode?: number, message?: string } = {};
		console.log(exception.constructor.name);
		console.log(exception);
		
		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(exception.code, exception.name);
			body.message = `${exception.code} ${exception.message}`;

			switch (exception.code) {
				case 'P2002': {
					body.statusCode = HttpStatus.CONFLICT;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
					return ;
				}
				case 'P2025': {
					body.statusCode = HttpStatus.NOT_FOUND;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
					return ;
				}
				default:
					body.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
					httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
					return ;
			}
		} else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
			if (exception.message.includes('Channels_password_constraint')) {
				body.message = 'Channes.password cannot be empty if type is PROTECTED';
			} else {
				body.message = exception.message;
			}
			body.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
			return ;
		} else if (exception instanceof HttpException || exception instanceof BadRequestException) {
			body.statusCode = exception.getStatus();
			body.message = exception.message;
			
			httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
			return ;
		} else {
			console.log(exception['message']);
			body.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			body.message = exception['message'];
			httpAdapter.reply(ctx.getResponse(), body, body.statusCode);
			return ;
		}
	}
}
