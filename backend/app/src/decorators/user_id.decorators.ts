import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserId = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.user_id;
	}
)

export const GatewayUserId = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const client = ctx.switchToWs().getClient();
		return client.user_id;
	}
)