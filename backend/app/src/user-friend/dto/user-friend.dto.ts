import { IsNotEmpty, IsString } from "class-validator";

export class UserFriendDto {

	@IsString()
	@IsNotEmpty()
	userId: string;

	@IsString()
	@IsNotEmpty()
	friendId: string;
}