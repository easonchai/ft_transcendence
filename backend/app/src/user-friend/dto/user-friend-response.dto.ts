import { PartialType } from "@nestjs/swagger";
import { UserFriends } from "@prisma/client";
import { UserFriendDto } from "./user-friend.dto";

export class UserResponseDto extends PartialType(UserFriendDto) {
	constructor(userFriend: UserFriends) {
		super();
		
	}
}