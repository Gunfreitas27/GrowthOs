import { NextResponse } from 'next/server';
import { runMaturityScoring } from '@/lib/maturity/scorer';
import { buildWorkspaceContext, getBusinessContext, getBrandContext } from '@/lib/business-context/graph';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST() {
  const workspaceId = await getCurrentWorkspaceId();

  const [ctx, businessContext, brandContext] = await Promise.all([
    buildWorkspaceContext(workspaceId),
    getBusinessContext(workspaceId),
    getBrandContext(workspaceId),
  ]);

  const scores = await runMaturityScoring(
    workspaceId,
    {
      questionnaire: businessContext as Record<string, unknown>,
      brandResearch: (brandContext as Record<string, unknown>).research_results as Record<string, unknown> | undefined,
    },
    ctx
  );

  return NextResponse.json({ ok: true, scores });
}
