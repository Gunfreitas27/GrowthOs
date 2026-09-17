import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { submitOnboardingSection } from '@/lib/onboarding/submit';

export async function POST(req: NextRequest) {
  // Resolved from the session, never from the request body — this route used
  // to trust a client-supplied workspaceId with zero ownership check.
  const workspaceId = await getCurrentWorkspaceId();
  const { sectionKey, answers } = (await req.json()) as {
    sectionKey: string;
    answers: Record<string, string | string[]>;
  };

  const result = await submitOnboardingSection({ workspaceId, sectionKey, answers });

  return NextResponse.json({ ok: true, ...result });
}
