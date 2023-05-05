import { User } from "@prisma/client";
import { Image } from "antd";
import React, { useEffect } from "react";

interface ProfilePicImageProps {
  user: User;
}

const ProfilePicImage = (props: ProfilePicImageProps) => {
  return props && props.user && props.user.image ? (
    <Image
      src={
        props.user.image
          ? props.user.image.substring(0, 4) === "http"
            ? props.user.image
            : `${process.env.NEXT_PUBLIC_NESTJS_URL}/users/image/${props.user.id}`
          : `https://source.boringavatars.com/pixel/150/${new Date().getTime()}`
      }
      width={150}
      height={150}
      preview={false}
      className="cursor-pointer rounded-full object-fill"
    />
  ) : (
    <></>
  );
};

export default ProfilePicImage;
