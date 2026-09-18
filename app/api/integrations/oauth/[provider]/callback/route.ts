import { NextRequest, NextResponse } from 'next/server';
import { db, mcpConnections } from '@/lib/db';
import { getProvider } from '@/lib/integrations/providers';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { encryptToken } from '@/lib/integrations/token-crypto';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerId } = await params;
  const provider = getProvider(providerId);
  const url = req.nextUrl;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = req.cookies.get(`oauth_state_${providerId}`)?.value;

  const errorRedirect = (reason: string) =>
    NextResponse.redirect(`${url.origin}/integrations?error=${encodeURIComponent(reason)}`);

  if (!provider || !code || !state || state !== expectedState) {
    return errorRedirect('invalid_request');
  }

  const workspaceId = await getCurrentWorkspaceId();
  const redirectUri = `${url.origin}/api/integrations/oauth/${providerId}/callback`;

  const tokenRes = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: provider.clientId!,
      client_secret: provider.clientSecret!,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.error(`[oauth:${providerId}] token exchange failed:`, await tokenRes.text());
    return errorRedirect('token_exchange_failed');
  }

  const tokenData = (await tokenRes.json()) as Record<string, unknown>;
  const encrypted = encryptToken(JSON.stringify(tokenData));

  await db
    .insert(mcpConnections)
    .values({ workspaceId, platform: providerId, accessTokenEnc: encrypted, status: 'connected', lastSync: new Date() })
    .onConflictDoUpdate({
      target: [mcpConnections.workspaceId, mcpConnections.platform],
      set: { accessTokenEnc: encrypted, status: 'connected', lastSync: new Date() },
    });

  const res = NextResponse.redirect(`${url.origin}/integrations?connected=${providerId}`);
  res.cookies.delete(`oauth_state_${providerId}`);
  return res;
}
