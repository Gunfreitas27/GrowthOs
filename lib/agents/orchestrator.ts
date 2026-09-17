import { invokeSkillStream, WorkspaceContext } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';
import { db, moduleStates } from '@/lib/db';
import { MODULE_KEYS, type ModuleKey, type ModuleUnlockContent, type SSEChunk } from './types';
import { and, eq } from 'drizzle-orm';

// The orchestrator uses advisory-board (11 strategic advisors: Dalio, Munger, Thiel...)
// as primary intelligence, and c-level-squad (AI maturity + executive coordination) for routing.
// It streams responses as SSE chunks and may emit module_unlock events.

export interface OrchestratorInput {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Module unlock thresholds — the actual product rule for "how mature does a
// workspace need to be before module X appears". Split out as pure functions
// (no DB) so this rule is unit-testable without mocking Drizzle — see
// lib/agents/orchestrator.test.ts.
const UNLOCK_THRESHOLDS: Record<ModuleKey, number> = {
  strategy: 1,          // unlock after any maturity data
  branding: 1,
  paid: 2,              // needs some aquisicao_paga score
  seo: 2,
  crm: 2.5,
  analytics: 2,
  outbound: 3,
  community: 3,
  project: 1.5,
  integrations: 1,
};

export function computeAverageScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function meetsUnlockThreshold(
  moduleKey: ModuleKey,
  scores: Record<string, number>
): boolean {
  return computeAverageScore(scores) >= (UNLOCK_THRESHOLDS[moduleKey] ?? 2);
}

// Module unlock logic: orchestrator can unlock modules based on maturity scores
async function shouldUnlockModule(
  workspaceId: string,
  moduleKey: ModuleKey,
  scores: Record<string, number>
): Promise<boolean> {
  const existing = await db.query.moduleStates.findFirst({
    where: and(
      eq(moduleStates.workspaceId, workspaceId),
      eq(moduleStates.moduleKey, moduleKey)
    ),
  });

  if (existing && existing.status !== 'hidden') return false;

  return meetsUnlockThreshold(moduleKey, scores);
}

export async function unlockModule(workspaceId: string, moduleKey: ModuleKey) {
  await db
    .insert(moduleStates)
    .values({ workspaceId, moduleKey, status: 'revealed', revealedAt: new Date() })
    .onConflictDoUpdate({
      target: [moduleStates.workspaceId, moduleStates.moduleKey],
      set: { status: 'revealed', revealedAt: new Date() },
    });
}

// Shared by streamOrchestrator (below, yields SSE chunks for chat) and
// lib/onboarding/submit.ts (no chat context — just needs the unlock to
// happen). Before this, a module only unlocked once the user sent a chat
// message, even if their diagnostic had already cleared the threshold —
// completing the onboarding form didn't unlock anything by itself.
export async function checkAndUnlockModules(
  workspaceId: string,
  scores: Record<string, number>
): Promise<ModuleKey[]> {
  if (!scores || Object.keys(scores).length === 0) return [];

  const unlocked: ModuleKey[] = [];

  for (const moduleKey of MODULE_KEYS) {
    if (await shouldUnlockModule(workspaceId, moduleKey, scores)) {
      await unlockModule(workspaceId, moduleKey);
      unlocked.push(moduleKey);
    }
  }

  return unlocked;
}

export async function* streamOrchestrator(
  input: OrchestratorInput,
  ctx: WorkspaceContext
): AsyncGenerator<SSEChunk> {
  // Build a prompt that includes maturity context for the advisory board
  const maturitySummary =
    Object.keys(ctx.maturityScores ?? {}).length > 0
      ? `Scores de maturidade: ${JSON.stringify(ctx.maturityScores)}`
      : 'Diagnóstico de maturidade ainda não realizado.';

  const userPrompt = `${input.userMessage}

${maturitySummary}

Contexto do negócio: ${JSON.stringify(ctx.businessContext ?? {})}`;

  // Primary: advisory-board (Dalio/Munger/Thiel board meeting protocol)
  const stream = await invokeSkillStream(
    'advisory-board',
    {
      task: userPrompt,
      context: input.conversationHistory
        .slice(-6)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n'),
    },
    ctx,
    MODELS.advanced
  );

  let fullResponse = '';

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      fullResponse += delta;
      yield { type: 'delta', data: delta };
    }
  }

  yield { type: 'done', data: fullResponse };

  // Check for module unlocks based on current maturity scores
  if (ctx.maturityScores && Object.keys(ctx.maturityScores).length > 0) {
    const unlocked = await checkAndUnlockModules(ctx.workspaceId, ctx.maturityScores);

    for (const moduleKey of unlocked) {
      const unlockContent: ModuleUnlockContent = {
        type: 'module_unlock',
        moduleKey,
        reason: 'Maturidade suficiente identificada pelo diagnóstico',
        message: `Módulo ${moduleKey} desbloqueado com base no seu diagnóstico de crescimento.`,
      };

      yield { type: 'module_unlock', data: unlockContent };
    }
  }
}
