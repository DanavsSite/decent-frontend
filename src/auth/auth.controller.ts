import { Body, Controller, Post, Res } from "@nestjs/common";
import { LoginDTO, RegisterDTO } from "src/dtos/auth.dto";
import { AuthService } from "./auth.service";
import { Response } from "express";
@Controller('auth')
export class AuthController {
	constructor(private service: AuthService) {}
	@Post('/register') // POST: {{host}}/register
	async register(@Body() dto: RegisterDTO, @Res() res: Response) {
		return await this.service.register(dto, res);
	}
	@Post('/login')
	async login(@Body() dto: LoginDTO, @Res() res: Response) {
		return await this.service.login(dto, res);
	}
}
