import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// USE_MOCK_DATA=true bypasses auth entirely — that mode never touches a real
// DB (see lib/mock/resolver.ts), and login would try to bootstrap a
// workspace against a DB that may not exist. Only outside mock mode does a
// real session become required.
//
// /api/mcp and /api/cron are NOT session-protected: they authenticate
// themselves (workspace API key / CRON_SECRET respectively — see
// app/api/mcp/route.ts and app/api/cron/route.ts) because their callers are
// machines, not a logged-in browser. Found by testing /api/mcp for real: the
// middleware was redirecting a Bearer-authenticated request to /login before
// the route ever got to check its own auth.
const PUBLIC_PATH_PREFIXES = ['/login', '/api/auth', '/api/cron', '/api/mcp'];

export default auth((req) => {
  if (process.env.USE_MOCK_DATA === 'true') return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
  if (isPublic || req.auth) return NextResponse.next();

  const loginUrl = new URL('/login', req.nextUrl.origin);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.skill$).*)'],
};
