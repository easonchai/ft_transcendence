import { ArgumentsHost, Catch, HttpException, HttpStatus, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
	
	catch(exception: unknown, host: ArgumentsHost): void {
		console.log(exception.constructor.name);
		
		const { httpAdapter } = this.httpAdapterHost;
		
		const ctx = host.switchToHttp();
		
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const msg = exception instanceof HttpException ? exception.message : "Error";
		
		const body = {
			statusCode: status,
			message: msg,
		};
		
		httpAdapter.reply(ctx.getResponse(), body, status);
	}
}