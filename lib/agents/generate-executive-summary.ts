import { askAdvisoryBoard } from './ask-advisory-board';
import { upsertBusinessContext } from '@/lib/business-context/graph';

// The answer to "what happens after the diagnostic?" (explicit product
// decision, 2026-09-16): instead of landing the user on a dashboard of bare
// numbers, generate a short, direct executive summary the moment scoring
// finishes — the #1 priority and a concrete first step, written for a
// non-technical owner/manager, not a growth specialist. Runs fire-and-forget
// alongside module unlocking in lib/onboarding/submit.ts.
export async function generateExecutiveSummary(workspaceId: string): Promise<string | null> {
  try {
    const { answer } = await askAdvisoryBoard(
      workspaceId,
      `O diagnóstico de maturidade de growth desta empresa acabou de ser calculado — você já tem os scores e o contexto do negócio.

Em no máximo 4 frases curtas, escreva um resumo executivo direto para o dono/gestor do negócio:
1. Qual é a prioridade número 1 agora, e por quê — baseado no maior gap identificado no diagnóstico.
2. Um primeiro passo concreto e específico para começar esta semana.

Tom: como um conselheiro experiente falando com um gestor que não é especialista em growth — direto, sem jargão de marketing, sem enrolação, sem "seções" ou listas numeradas na resposta, só o texto corrido.`
    );
    await upsertBusinessContext(workspaceId, { executive_summary: answer });
    return answer;
  } catch (err) {
    console.error('[generateExecutiveSummary] failed:', err);
    return null;
  }
}
