import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, mcpConnections } from '@/lib/db';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  const { provider } = await params;

  await db
    .update(mcpConnections)
    .set({ status: 'disconnected', accessTokenEnc: null })
    .where(and(eq(mcpConnections.workspaceId, workspaceId), eq(mcpConnections.platform, provider)));

  return NextResponse.json({ ok: true });
}
