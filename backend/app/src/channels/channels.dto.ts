import { ApiHideProperty, ApiProperty, PartialType } from "@nestjs/swagger";
import { ChannelMessages, Channels, ChannelType, ChannelUsers, ChannelUserType, User, UserStatus } from "@prisma/client";
import { IsEnum } from 'class-validator'

class CreatedUpdated {
	@ApiHideProperty()
	created_at: Date
	
	@ApiHideProperty()
	updated_at: Date
}

// Get

export class getChannelsDto extends CreatedUpdated implements Channels {
	@ApiProperty()
	id: number;
	
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	password: string | null;
	
	@ApiProperty({ enum: [ChannelType] })
	type: ChannelType;
}

export class getChannelMessagesDto extends CreatedUpdated implements ChannelMessages {
	@ApiProperty()
	id: number
	
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	message: string;
	
	@ApiProperty()
	created_at: Date;
}

export class getUserDto extends CreatedUpdated implements User {
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
	displayname: string;
	
	@ApiProperty({ enum: [UserStatus] })
	status: UserStatus;
}

export class getChannelUsersDto extends CreatedUpdated implements ChannelUsers {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	mute_time: Date;
	
	@ApiProperty({ enum: [ChannelUserType] })
	type: ChannelUserType;
	
	@ApiProperty()
	user: getUserDto;
}

// Create

export class createChannelDto {
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	password?: string;
	
	@ApiProperty()
	@IsEnum(ChannelType)
	type: ChannelType;
}

export class createChannelMessagesDto {
	@ApiProperty()
	message: string;
	
	@ApiProperty()
	channel_id: number;
}

// Update

export class updateChannelDto extends PartialType(createChannelDto) {
	
}