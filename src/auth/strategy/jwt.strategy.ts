import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(config: ConfigService, private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					let data = request.cookies["token"];
					if (!data) {
						return null;
					}
					return data;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: config.get("JWT_SECRET"),
		});
	}

	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	async validate(payload: any) {
		const user = await this.prisma.users.findUnique({
			where: {
				id: payload.sub,
			},
			include: {
				friends: true,
				pendingFriendRequests: true,
			},
		});
		// rome-ignore lint/performance/noDelete: <explanation>
		delete user.password;
		return { user };
	}
}
