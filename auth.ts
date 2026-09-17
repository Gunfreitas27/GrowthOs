import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db, users, workspaces } from '@/lib/db';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface Session {
    user: {
      workspaceId: string;
    } & DefaultSessionUser;
  }
}
// Re-declared locally to avoid pulling in the full next-auth type surface
// just for this one augmentation.
type DefaultSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// First login for an email: no `workspaces`/`users` row exists yet, so we
// bootstrap a personal workspace for them. Every subsequent login just looks
// the existing row up — a user belongs to exactly one workspace (see
// lib/db/schema.ts, users.workspaceId is a required FK).
async function resolveOrCreateWorkspaceIdForEmail(
  email: string,
  name: string | null | undefined
): Promise<string> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing.workspaceId;

  const slug = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: name?.trim() || email, slug })
    .returning();

  await db.insert(users).values({ workspaceId: workspace.id, email, name: name ?? null });

  return workspace.id;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Without this, Auth.js doesn't trust the request's own host/origin to
  // compute its callback/cookie URLs (no AUTH_URL is set here) — that
  // mismatch is what caused a real, reproduced failure: `InvalidCheck:
  // pkceCodeVerifier value could not be parsed` on the Google callback,
  // surfaced as /api/auth/error?error=Configuration. Standard requirement
  // for self-hosted Auth.js v5 without AUTH_URL — not something to remove
  // if the deploy target later has multiple domains without also setting
  // AUTH_URL as the fix instead.
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only populated on the initial sign-in call, not on token
      // refreshes — resolving once here and persisting workspaceId in the
      // JWT is what makes it available on every later request for free.
      if (user?.email) {
        token.workspaceId = await resolveOrCreateWorkspaceIdForEmail(user.email, user.name);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.workspaceId) {
        session.user.workspaceId = token.workspaceId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
