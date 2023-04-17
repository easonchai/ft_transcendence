import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class UserDto {
	@ApiProperty({ description: 'Player id' })
	@IsString()
	id: string;

	@ApiProperty({ description: 'Player defined name' })
	@IsString()
	displayname: string;

	@ApiProperty()
	@IsString()
	email: string;

	@ApiProperty({ description: 'Image is stored in the directory: "backend/app/src/uploads/profileimages"' })
	@IsString()
	image: string;

	@ApiProperty({ description: 'User can choose to activate 2FA' })
	@IsBoolean()
	enable2FA: boolean;

	@ApiProperty({
		description: 'User status',
		example: 'ONLINE, OFFLINE, IN THE GAME'
	})
	@IsNumber()
	status: UserStatus;
}