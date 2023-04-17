import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserResponseDto } from "src/user/dto";

export class UserBlockDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	blockerId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	blockedId: string;

	@ApiProperty()
	blocker: UserResponseDto;

	@ApiProperty()
	blocked: UserResponseDto;
}