import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { Role } from "@/types/enums";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash || "");
                    if (passwordsMatch) return { ...user, role: user.role as Role };
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as Role;
                session.user.organizationId = token.organizationId as string | null | undefined;
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) return token;
            // We could fetch fresh user data here or trust the token if immutable enough
            // For role changes to reflect immediately, fetching is safer
            // But to avoid DB hit every request, we can assume token is valid for session duration
            // Let's fetch for now to be safe
            try {
                const user = await prisma.user.findUnique({ where: { id: token.sub } });
                if (user) {
                    token.role = user.role;
                    token.organizationId = user.organizationId;
                }
            } catch (error) {
                // Handle potential DB error
            }
            return token;
        }
    },
});
