import { ApiHideProperty, ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { ChannelMessages, Channels, ChannelType, ChannelUsers, ChannelUserType, User, UserStatus, ChannelBannedUsers } from "@prisma/client";
import { Socket } from 'socket.io'
import { Allow, IsDate, IsEnum } from 'class-validator'

class CreatedUpdated {
	@ApiHideProperty()
	created_at: Date
	
	@ApiHideProperty()
	updated_at: Date
}

// Get

// export class getChannelsDto extends CreatedUpdated implements Partial<Channels> {
export class GetChannelsDto extends CreatedUpdated implements Omit<Channels, 'password'> {
	@ApiProperty()
	id: number;
	
	@ApiProperty()
	name: string;
	
	@ApiProperty({ enum: [ChannelType] })
	type: ChannelType;
}

export class GetChannelMessagesDto extends CreatedUpdated implements ChannelMessages {
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

export class GetChannelUsersDto extends CreatedUpdated implements ChannelUsers {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	mute_time: Date;
	
	@ApiProperty({ enum: [ChannelUserType] })
	type: ChannelUserType;
	
	@ApiProperty()
	user: GetUserDto;
}

export class GetChannelBannedUsers extends CreatedUpdated implements ChannelBannedUsers {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	user: GetUserDto;
}

// Create

export class CreateChannelDto {
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	password?: string;
	
	@ApiProperty()
	@IsEnum(ChannelType)
	type: ChannelType;
}

export class CreateChannelMessagesDto {
	@ApiProperty()
	message: string;
}

export class CreateChannelUsersDto {
	@ApiProperty()
	password?: string;
	
	@ApiProperty()
	type?: ChannelUserType
	
	@ApiProperty()
	@IsDate()
	mute_time?: Date
}

// Update

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}

export class UpdateChannelUserDto extends PartialType(CreateChannelUsersDto) {}

// Socket

export class ChannelsSocketMessageDto {
	@Allow()
	message: string;
}