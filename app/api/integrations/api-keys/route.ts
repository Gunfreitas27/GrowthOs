import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { createWorkspaceApiKey, revokeWorkspaceApiKey } from '@/lib/auth/api-keys';
import { resolveApiKeys } from '@/lib/mock/resolver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  const keys = await resolveApiKeys(workspaceId);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  const { plaintext, keyPrefix } = await createWorkspaceApiKey(workspaceId, name.trim());

  // plaintext is returned exactly once — the caller must show/store it now,
  // nothing after this response can ever recover it (only the hash is kept).
  return NextResponse.json({ plaintext, keyPrefix });
}

export async function DELETE(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const revoked = await revokeWorkspaceApiKey(workspaceId, id);
  if (!revoked) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
