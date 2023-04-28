import { User as PrismaUser, TwoFactorStatus } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

export interface TwoFactorSetup {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url: string;
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User;
    two_fa?: TwoFactorStatus | null;
  }

  interface User extends PrismaUser {}
}
