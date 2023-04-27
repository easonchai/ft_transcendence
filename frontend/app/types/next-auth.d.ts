import { User as PrismaUser } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

export type TwoFaStatus = 'PASSED' | 'REQUIRED' | 'NONE'

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user:	User
		two_fa: TwoFaStatus
  }
	
	interface User extends PrismaUser {
		
	}
	
}