import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { LoginDTO, RegisterDTO } from "src/dtos/auth.dto";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import Encryption from "encrypt-decrypt-library";
import { ConfigService } from "@nestjs/config";
import { AES } from "crypto-ts";
const encryption = new Encryption({
	encryptionKey: process.env.ENCODING_STR,
});

@Controller('auth')
export class AuthController {
	constructor(private service: AuthService, private config: ConfigService) {}
	@Post('/register') // POST: {{host}}/register
	async register(@Body() dto: RegisterDTO, @Res() res: Response) {
		return await this.service.register(dto, res);
	}
	@Post('/login')
	async login(@Body() dto: LoginDTO, @Res() res: Response) {
		return await this.service.login(dto, res);
	}
	@Get('/token')
	getToken(@Req() token: Request) {
		const encryptedMessage = AES.encrypt(
			token.cookies["jwt"],
			this.config.get("ENCODING_STR"),
		).toString();
		return encryptedMessage;
	}
}
