import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";
import { UserResponseDto } from "src/user/dto";
import { UserFriendResponseDto } from "./user-friend-response.dto";

export class UserFriendDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	userId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	friendId: string;

	@ApiProperty()
	user: UserResponseDto;

	@ApiProperty()
	friend: UserResponseDto;
}