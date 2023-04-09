import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(exception.code, exception.name);

			switch (exception.code) {
				case 'P2002': {
					const status = HttpStatus.CONFLICT;
					return response.status(status).json({
						statusCode: status,
						message: exception.message,
					});
				}
				case 'P2025': {
					const status = HttpStatus.NOT_FOUND;
					return response.status(status).json({
						statusCode: status, 
						message: exception.message
					})
				}
				default:
					// default 500 error code
					const status = HttpStatus.INTERNAL_SERVER_ERROR;
					return response.status(status).json({
						statusCode: status,
						message: `${exception.code} ${exception.message}`
					})
			}
		} else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
			console.log(exception);
			const status = HttpStatus.INTERNAL_SERVER_ERROR;
			return response.status(status).json({
				statusCode: status,
				message: exception.message,
			})
		}
	}
}
