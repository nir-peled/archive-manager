import { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authConfig: AuthOptions = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
		}),
	],
	adapter: PrismaAdapter(prisma),
};
