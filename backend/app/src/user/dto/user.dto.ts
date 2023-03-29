import { UserStatus } from "@prisma/client";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class UserDto {
	@IsString()
	displayname: string;

	@IsString()
	email: string;

	@IsString()
	image: string;

	@IsBoolean()
	enable2FA: boolean;

	@IsNumber()
	status: UserStatus;
}