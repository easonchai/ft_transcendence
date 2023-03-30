import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserFriendDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	userId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	friendId: string;


}