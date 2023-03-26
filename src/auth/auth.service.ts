import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { LoginDTO, RegisterDTO } from "src/dtos/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from "argon2";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Users } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class AuthService {
	constructor(
		private db: PrismaService,
		private jwt: JwtService,
		private config: ConfigService,
	) {}
	async register(dto: RegisterDTO, res: Response) {
		try {
			const hash = await argon.hash(dto.password);
			const avatarurl = new URL("https://api.dicebear.com/5.x/shapes/svg");
			avatarurl.searchParams.append("seed", dto.username);
			const user = await this.db.users.create({
				data: {
					username: dto.username,
					email: dto.email,
					password: hash,
					avatarSVGURL: avatarurl.toString(),
				},
			});
			const token = await this.signToken(user);
			return res
				.cookie("jwt", token, {
					expires: new Date(Date.now() + 3600000 * 24 * 30),
					httpOnly: true,
					secure: true,
				})
				.status(200)
				.json(user);
		} catch (e) {
			if (e.code === "P2002") {
				return res.status(403).send("Duplicate email address");
			} else {
				res.send(e);
			}
		}
	}
	async login(dto: LoginDTO, res: Response) {
		try {
			const user = await this.db.users.findUnique({
				where: {
					email: dto.email,
				},
			});
			const isCorrect = await argon.verify(user.password, dto.password);
			if (isCorrect) {
				const token = await this.signToken(user);
				console.log(token)
				res.cookie("jwt", token, {
					expires: new Date(Date.now() + 3600000 * 24 * 30),
					secure: true,
				});
				// rome-ignore lint/performance/noDelete: <explanation>
				delete user.password;
				return res
					.cookie("jwt", token, {
						expires: new Date(Date.now() + 3600000 * 24 * 30),
						secure: true,
					})
					.status(200)
					.json({ user, token });
			} else {
				return res.status(401).send(`Incorrect password for ${user.username}`);
			}
		} catch (e) {
			return res.json(e);
		}
	}
	async signToken(user: Users) {
		const payload = {
			sub: user.id,
			email: user.email,
		};
		const token = this.jwt.sign(payload, {
			expiresIn: "30days",
			secret: this.config.get("JWT_SECRET"),
		});
		return token;
	}
}
