import NextAuth, { AuthOptions } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school"
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
	providers: [
		FortyTwoProvider({
			clientId: process.env.FORTYTWO_ID!,
			clientSecret: process.env.FORTYTWO_SECRET!,
		})
	],
	callbacks: {
		async session({session, token, user}) {
			
			// session.user = await MyPrisma.getPrisma().user.findUniqueOrThrow({ where: { id: user.id } });
			session.user = user;
			return session;
		}
	}
}


export default NextAuth(authOptions);