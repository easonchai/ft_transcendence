import NextAuth, { AuthOptions, Session } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

class MyPrisma {
  public static Prisma: PrismaClient;

  static getPrisma() {
    // create a new instance of PrismaClient if one isn't already created
    this.Prisma ||= new PrismaClient();
    return this.Prisma;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(MyPrisma.getPrisma()),
  session: { strategy: "database" },
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTYTWO_ID!,
      clientSecret: process.env.FORTYTWO_SECRET!,
      profile(profile) {
        return {
          ...profile,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token, trigger, user, newSession }) {
      /**
       * Currently, the best way is to actually retrieve the session info manually
       * We just attach the 2FA status to the session
       */
      const prisma = await MyPrisma.getPrisma();
      const dbSession = await prisma.session.findFirst({
        where: {
          userId: user.id,
        },
      });

      // Attach user to session
      session.user = user;

      // Attach 2FA status to user to persist even after refresh
      if (trigger === "update" && newSession?.two_fa) {
        session.two_fa = newSession.two_fa;
      } else {
        session.two_fa = dbSession?.twoFaStatus;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
