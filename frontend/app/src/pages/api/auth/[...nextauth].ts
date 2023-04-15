import NextAuth, { AuthOptions } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school"
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		FortyTwoProvider({
			clientId: process.env.FORTYTWO_ID!,
			clientSecret: process.env.FORTYTWO_SECRET!,
		})
	],
}


export default NextAuth(authOptions);