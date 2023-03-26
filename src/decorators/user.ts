import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request = ctx.switchToWs().getClient();

		return request.handshake.headers.authorization;
	},
);
