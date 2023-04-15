import { ArgumentsHost, BadRequestException, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Prisma } from "@prisma/client";

@Catch()
export class SocketExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		console.log(exception.constructor.name)
		
		if (exception instanceof BadRequestException) super.catch(new WsException(exception.getResponse()), host)
		else if (exception instanceof Prisma.PrismaClientKnownRequestError) super.catch(new WsException(exception.message), host)
		else if (exception instanceof Prisma.PrismaClientUnknownRequestError) super.catch(new WsException('Prisma error'), host);
		else if (exception instanceof HttpException) super.catch(new WsException(exception.message), host);
		else super.catch(new WsException('Error'), host);
	}
}