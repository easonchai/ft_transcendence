import { PartialType } from "@nestjs/swagger";
import { User, UserBlocks } from "@prisma/client";
import { UserResponseDto } from "src/user/dto";
import { UserBlockDto } from "./user-block.dto";

export class UserBlockResponseDto extends PartialType(UserBlockDto) {
	constructor(userBlocks: UserBlocks, blocker: User, blocked: User) {
		super();
		this.blockerId = userBlocks.blocker_id;
		this.blockedId = userBlocks.blocked_id;
		this.blocker = new UserResponseDto(blocker);
		this.blocked = new UserResponseDto(blocked)
	}
}