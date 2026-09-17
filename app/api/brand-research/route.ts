import { NextRequest, NextResponse } from 'next/server';
import { runBrandResearch } from '@/lib/agents/brand-research-skill';
import { buildWorkspaceContext, getBusinessContext } from '@/lib/business-context/graph';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  const { website } = (await req.json()) as { website: string };

  if (!website) {
    return NextResponse.json({ error: 'Missing website' }, { status: 400 });
  }

  const [ctx, businessContext] = await Promise.all([
    buildWorkspaceContext(workspaceId),
    getBusinessContext(workspaceId),
  ]);

  const results = await runBrandResearch(
    { workspaceId, website, businessContext: businessContext as Record<string, unknown> },
    ctx
  );

  return NextResponse.json({ ok: true, results });
}
