import { FileTypeValidator, ParseFilePipe, UploadedFile } from "@nestjs/common";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { ChannelUserType, ChannelUsers, FriendStatus, User, UserBlocks, UserFriends, UserMessages, UserStatus } from "@prisma/client";
import { Allow, registerDecorator, ValidationOptions } from "class-validator";

class CreatedUpdated {
	@ApiHideProperty()
	created_at: Date
	
	@ApiHideProperty()
	updated_at: Date
}

export class GetUserDto extends CreatedUpdated implements User {
	@ApiProperty()
	id: string;
	
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	email: string | null;
	
	@ApiProperty()
	emailVerified: Date | null;
	
	@ApiProperty()
	image: string | null;
	
	@ApiProperty()
	two_factor: boolean;
	
	@ApiProperty({ enum: [UserStatus] })
	status: UserStatus;
}

export class GetUserMessages extends CreatedUpdated implements UserMessages {
	@ApiProperty()
	id: number
	
	@ApiProperty()
	message: string;
	
	@ApiProperty()
	sender_id: string;
	
	@ApiProperty()
	receiver_id: string;
}

export class GetUserChannels extends CreatedUpdated implements ChannelUsers {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	type: ChannelUserType;
	
	@ApiProperty()
	mute_time: Date;
}

export class GetUserFriends extends CreatedUpdated implements UserFriends {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	friend_id: string;
	
	@ApiProperty()
	status: FriendStatus;
}

export class GetUserBlock extends CreatedUpdated implements UserBlocks {
	@ApiProperty()
	blocked_by_id: string;
	
	@ApiProperty()
	blocked_id: string;
}


export class CreateUserMessagesDto {
	@ApiProperty()
	message: string;
}

export class UpdateUserDto {
	@ApiProperty()
	name?: string;
	
	@ApiProperty()
	two_factor?: boolean;
}

export class UpdateUserFriendsDto {
	@ApiProperty({ enum: [FriendStatus] })
	status: FriendStatus
}

export class ChatSocketMessageDto {
	@Allow()
	message: string;
}
