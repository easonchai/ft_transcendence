import UserDetails from "@/components/UserDetails";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function UserDet() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;

  useEffect(() => {
    if (session && session.user && session.user.id === id) router.push(`/`);
  }, [id, session]);

  return id && <UserDetails isMe={false} id={id as string} />;
}
