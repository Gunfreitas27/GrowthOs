import { invokeSkill, WorkspaceContext } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';
import { db, maturityScores } from '@/lib/db';
import { MATURITY_DIMENSIONS, type MaturityDimension } from '@/lib/agents/types';
import { eq } from 'drizzle-orm';
import { extractJson } from '@/lib/llm-json';

interface DiagnosticInput {
  questionnaire: Record<string, unknown>;
  brandResearch?: Record<string, unknown>;
}

interface ScoredDimension {
  dimension: MaturityDimension;
  score: number;
  rationale: string;
}

// Scores come from an LLM asked to return strict JSON — clamp defensively
// since nothing stops the model from returning e.g. 7 or -1. Pure and
// exported so this boundary is unit-testable without mocking OpenRouter/DB —
// see lib/maturity/scorer.test.ts.
export function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(5, score));
}

// data-squad (Sean Ellis) scores growth dimensions
// brand-squad (Keller CBBE native) scores brand dimension
async function scoreDimensions(
  input: DiagnosticInput,
  ctx: WorkspaceContext
): Promise<ScoredDimension[]> {
  const [growthResult, brandResult] = await Promise.all([
    invokeSkill(
      'data-squad',
      {
        task: `Avalie a maturidade de growth desta empresa em todas as dimensões abaixo e retorne um JSON array.

Dimensões a pontuar (score 0.0–5.0):
- awareness_posicionamento: presença de marca, brand salience, reconhecimento
- aquisicao_paga: eficiência de canais pagos, CAC, ROAS, cobertura
- organico_conteudo: SEO, autoridade de domínio, presença editorial
- crm_lifecycle: LTV:CAC, churn, nurture flows, retenção
- analytics_atribuicao: qualidade de dados, tracking, atribuição cross-canal

O campo "rationale" é lido diretamente pelo dashboard do cliente — escreva em português do Brasil, sempre, mesmo que o resto do seu raciocínio interno seja em outro idioma.

Responda APENAS com JSON válido no formato:
[{"dimension": "...", "score": 0.0, "rationale": "..."}]`,
        data: { questionnaire: input.questionnaire, brandResearch: input.brandResearch },
      },
      ctx
    ),
    invokeSkill(
      'brand-squad',
      {
        task: `Avalie a maturidade de diferenciação competitiva desta empresa usando o modelo CBBE (Keller) e Five Forces (Porter).

Dimensões a pontuar (score 0.0–5.0):
- diferenciacao_competitiva: vantagem competitiva sustentável, moat, posicionamento único

O campo "rationale" é lido diretamente pelo dashboard do cliente — escreva em português do Brasil, sempre, mesmo que o resto do seu raciocínio interno seja em outro idioma.

Responda APENAS com JSON válido no formato:
[{"dimension": "diferenciacao_competitiva", "score": 0.0, "rationale": "..."}]`,
        data: { questionnaire: input.questionnaire, brandResearch: input.brandResearch },
      },
      ctx,
      MODELS.advanced
    ),
  ]);

  const results: ScoredDimension[] = [];

  if (growthResult.ok) {
    const parsed = extractJson<ScoredDimension[]>(growthResult.content);
    if (parsed) {
      results.push(...parsed);
    } else {
      console.error(
        '[Scorer] Failed to parse data-squad response. Raw (first 300 chars):',
        growthResult.content.slice(0, 300)
      );
    }
  }

  if (brandResult.ok) {
    const parsed = extractJson<ScoredDimension[]>(brandResult.content);
    if (parsed) {
      results.push(...parsed);
    } else {
      console.error(
        '[Scorer] Failed to parse brand-squad response. Raw (first 300 chars):',
        brandResult.content.slice(0, 300)
      );
    }
  }

  return results;
}

export async function runMaturityScoring(
  workspaceId: string,
  input: DiagnosticInput,
  ctx: WorkspaceContext
): Promise<Record<MaturityDimension, number>> {
  const scored = await scoreDimensions(input, ctx);

  // Only known dimensions, clamped — anything else means the LLM invented a
  // dimension name or returned an out-of-range score, and the *returned*
  // record needs to match what's actually persisted below, not the raw
  // LLM output (a caller trusting this as Record<MaturityDimension, number>
  // shouldn't see a bogus key or a score outside 0-5).
  const result: Partial<Record<MaturityDimension, number>> = {};

  for (const item of scored) {
    if (!MATURITY_DIMENSIONS.includes(item.dimension as MaturityDimension)) continue;

    const score = clampScore(item.score);
    result[item.dimension] = score;

    await db
      .insert(maturityScores)
      .values({ workspaceId, dimension: item.dimension, score, rationale: item.rationale })
      .onConflictDoUpdate({
        target: [maturityScores.workspaceId, maturityScores.dimension],
        set: { score, rationale: item.rationale, updatedAt: new Date() },
      });
  }

  return result as Record<MaturityDimension, number>;
}
