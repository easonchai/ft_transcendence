import { useSession } from "next-auth/react";

import UserDetails from "@/components/UserDetails";

export default function Home() {
  const { data: session } = useSession();

  return (
    session && session.user && <UserDetails isMe={true} id={session.user.id} />
  );
}
