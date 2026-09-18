import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getProvider, isProviderConfigured } from '@/lib/integrations/providers';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  // Throws (and 500s, correctly) if there's no session — this route only
  // ever runs behind middleware's auth redirect anyway, this is just the
  // point where workspace identity actually gets resolved.
  await getCurrentWorkspaceId();

  const { provider: providerId } = await params;
  const provider = getProvider(providerId);

  if (!provider || !isProviderConfigured(providerId)) {
    return NextResponse.json({ error: 'Provider not configured' }, { status: 400 });
  }

  const state = randomBytes(16).toString('hex');
  const redirectUri = `${req.nextUrl.origin}/api/integrations/oauth/${providerId}/callback`;

  const authUrl = new URL(provider.authorizeUrl);
  authUrl.searchParams.set('client_id', provider.clientId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', provider.scope);
  authUrl.searchParams.set('state', state);
  for (const [key, value] of Object.entries(provider.extraAuthParams ?? {})) {
    authUrl.searchParams.set(key, value);
  }

  const res = NextResponse.redirect(authUrl.toString());
  // Short-lived, httpOnly — verified against the `state` the provider sends
  // back on the callback, so a forged callback request can't create/hijack
  // a connection for this workspace.
  res.cookies.set(`oauth_state_${providerId}`, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
