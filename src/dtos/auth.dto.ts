import { IsNotEmpty, IsEmail, IsString, Min } from "class-validator";

export class LoginDTO {
	@IsEmail()
    @IsNotEmpty()
	email: string;
	@IsNotEmpty()
    @IsString()
	password: string;
}

export class RegisterDTO {
	@IsString()
    @IsNotEmpty()
	username: string;
	@IsEmail()
    @IsNotEmpty()
	email: string;
	@IsNotEmpty()
    @IsString()
	password: string;
}
