import { ApiHideProperty, ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { ChannelMessages, Channels, ChannelType, ChannelUsers, ChannelUserType, User, UserStatus, ChannelBannedUsers } from "@prisma/client";
import { Type } from "class-transformer";
import { Allow, IsDate, IsEnum, IsOptional } from 'class-validator'

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
	user: User;
}

export class GetChannelBannedUsers extends CreatedUpdated implements ChannelBannedUsers {
	@ApiProperty()
	user_id: string;
	
	@ApiProperty()
	channel_id: number;
	
	@ApiProperty()
	user: User;
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
	
	@ApiProperty({ required: false })
	@IsDate()
	@Type(() => Date)
	@IsOptional()
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