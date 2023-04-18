import { User } from "@prisma/client"
import NextAuth from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: AdapterUser
  }
}