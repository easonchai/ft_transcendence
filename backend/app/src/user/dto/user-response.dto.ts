import { PartialType } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { UserDto } from "./user.dto";

export class UserResponseDto extends PartialType(UserDto) {
	constructor(user: User) {
	  super();
	  this.id = user.id;
	  this.displayname = user.displayname;
	  this.email = user.email;
	  this.image = user.image;
	  this.status = user.status;
	//   this.enable2FA = user.enable2FA;

	}
  }