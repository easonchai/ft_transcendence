import { User } from "@prisma/client";
import { Avatar } from "antd";
import React from "react";

interface ProfilePicAvatarProps {
  user: User;
}

const ProfilePicAvatar = (props: ProfilePicAvatarProps) => {
  return (
    props &&
    props.user &&
    props.user.image && (
      <Avatar
        src={
          props.user.image
            ? props.user.image.substring(0, 4) === "http"
              ? props.user.image
              : `${process.env.NEXT_PUBLIC_NESTJS_URL}/users/image/${props.user.id}`
            : `https://source.boringavatars.com/pixel/150/${new Date().getTime()}`
        }
      />
    )
  );
};

export default ProfilePicAvatar;
