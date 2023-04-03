import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
@Controller('user')
export class UserController {
	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	getUser(@Req() req: Request) {
		return req.user;
	}
	@UseGuards(AuthGuard('jwt'))
	@Get('fre')
	getFriends(@Req() req: Request) {
		return req.user;
	}
}
