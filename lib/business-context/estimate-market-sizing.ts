import { invokeSkill, type WorkspaceContext } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';
import { extractJson } from '@/lib/llm-json';
import { upsertBusinessContext } from './graph';

interface MarketSizingEstimate {
  tam_sam_som: string;
  north_star_metric: string;
}

// TAM/SAM/SOM and "North Star Metric" both require growth expertise the
// person filling the onboarding form doesn't have — they were removed from
// lib/onboarding/sections.ts for exactly this reason (2026-09-16, explicit
// product decision: "o usuário não é técnico em growth, ele pode ser um
// gestor"). The AI estimates them instead, from what a non-specialist CAN
// answer easily (segment, stage, business model, region if CNPJ-enriched).
// Directional estimates, not market research — the prompt says so, and
// wherever this is shown in the UI it should read as an estimate too.
export async function estimateMarketSizing(
  workspaceId: string,
  ctx: WorkspaceContext
): Promise<MarketSizingEstimate | null> {
  const result = await invokeSkill(
    'data-squad',
    {
      task: `Com base no contexto de negócio abaixo, estime duas coisas para esta empresa:

1. tam_sam_som: uma estimativa DIRECIONAL de tamanho de mercado (TAM/SAM/SOM) em reais, no formato "TAM R\${valor}, SAM R\${valor}, SOM R\${valor}" (ex: "TAM R$2b, SAM R$400m, SOM R$50m"). Use seu conhecimento do setor; se houver dados reais de mercado/região no contexto (marketSignals), priorize-os sobre estimativa genérica.
2. north_star_metric: a métrica de crescimento mais adequada para o estágio e modelo de negócio dessa empresa (ex: MRR para SaaS recorrente, GMV para marketplace/e-commerce, Receita para negócio transacional simples) — responda só o nome da métrica, bem curto.

Seja honesto: isto é uma estimativa qualificada, não um dado de pesquisa de mercado real — a rationale deve deixar isso implícito no tom, sem soar como fato absoluto.

Responda APENAS com JSON válido, em português do Brasil, no formato:
{"tam_sam_som": "...", "north_star_metric": "..."}`,
    },
    ctx,
    MODELS.default
  );

  if (!result.ok) {
    console.error('[estimateMarketSizing] skill failed:', result.reason);
    return null;
  }

  const parsed = extractJson<MarketSizingEstimate>(result.content);
  if (!parsed) {
    console.error(
      '[estimateMarketSizing] failed to parse response. Raw (first 300 chars):',
      result.content.slice(0, 300)
    );
    return null;
  }

  await upsertBusinessContext(workspaceId, parsed);
  return parsed;
}
