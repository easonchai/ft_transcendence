import { PartialType } from "@nestjs/swagger";
import { User, UserFriends } from "@prisma/client";
import { UserResponseDto } from "src/user/dto";
import { UserFriendDto } from "./user-friend.dto";

export class UserFriendResponseDto extends PartialType(UserFriendDto) {
	constructor(userFriend: UserFriends, user: User, friend: User) {
		super();
		this.friendId = userFriend.friend_id;
		this.userId = userFriend.user_id;
		this.user = new UserResponseDto(user);
		this.friend = new UserResponseDto(friend);

	}
}