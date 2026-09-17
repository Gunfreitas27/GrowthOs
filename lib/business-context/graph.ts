import { db, businessContext, brandContext, maturityScores } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getWorkspaceMarketSignals } from '@/lib/enrichment/read';
import type { MarketSignals } from '@/lib/enrichment/types';

export interface BusinessContextData {
  segment?: string;
  stage?: 'pre_revenue' | 'early' | 'growth' | 'scale' | 'mature';
  website?: string;
  cnpj?: string;
  tam_sam_som?: string;
  icp?: Record<string, unknown>;
  jbtd?: string;
  channels?: string[];
  ltv_cac?: number;
  budget?: string;
  competitors?: string[];
  objectives?: string[];
  // AI-estimated, not asked in the onboarding form — see
  // lib/business-context/estimate-market-sizing.ts for why.
  north_star_metric?: string;
  executive_summary?: string;
}

export interface BrandContextData {
  brief?: string;
  voice?: string;
  archetype?: string;
  colors?: string[];
  typography?: string;
  tagline?: string;
  manifesto?: string;
  brandbook_url?: string;
  research_results?: Record<string, unknown>;
}

export async function getBusinessContext(
  workspaceId: string
): Promise<BusinessContextData> {
  const row = await db.query.businessContext.findFirst({
    where: eq(businessContext.workspaceId, workspaceId),
  });
  return (row?.data as BusinessContextData) ?? {};
}

export async function upsertBusinessContext(
  workspaceId: string,
  patch: Partial<BusinessContextData>
) {
  const existing = await getBusinessContext(workspaceId);
  const merged = { ...existing, ...patch };

  await db
    .insert(businessContext)
    .values({ workspaceId, data: merged })
    .onConflictDoUpdate({
      target: businessContext.workspaceId,
      set: { data: merged, updatedAt: new Date() },
    });

  return merged;
}

export async function getBrandContext(
  workspaceId: string
): Promise<BrandContextData> {
  const row = await db.query.brandContext.findFirst({
    where: eq(brandContext.workspaceId, workspaceId),
  });
  return (row?.data as BrandContextData) ?? {};
}

export async function upsertBrandContext(
  workspaceId: string,
  patch: Partial<BrandContextData>
) {
  const existing = await getBrandContext(workspaceId);
  const merged = { ...existing, ...patch };

  await db
    .insert(brandContext)
    .values({ workspaceId, data: merged })
    .onConflictDoUpdate({
      target: brandContext.workspaceId,
      set: { data: merged, updatedAt: new Date() },
    });

  return merged;
}

export async function getMaturityScores(
  workspaceId: string
): Promise<Record<string, number>> {
  const rows = await db.query.maturityScores.findMany({
    where: eq(maturityScores.workspaceId, workspaceId),
  });
  return Object.fromEntries(rows.map((r) => [r.dimension, r.score]));
}

export interface MaturityScoreDetail {
  score: number;
  rationale: string | null;
}

// The LLM generates a one-sentence rationale per dimension alongside the
// score (see lib/maturity/scorer.ts) — this is what lets the dashboard show
// *why* a score is what it is instead of a bare number. getMaturityScores()
// stays number-only for the many callers (agents, MCP tools) that only ever
// needed the score for prompt context.
export async function getMaturityScoresDetailed(
  workspaceId: string
): Promise<Record<string, MaturityScoreDetail>> {
  const rows = await db.query.maturityScores.findMany({
    where: eq(maturityScores.workspaceId, workspaceId),
  });
  return Object.fromEntries(
    rows.map((r) => [r.dimension, { score: r.score, rationale: r.rationale }])
  );
}

export async function buildWorkspaceContext(workspaceId: string) {
  const [bc, brand, scores] = await Promise.all([
    getBusinessContext(workspaceId),
    getBrandContext(workspaceId),
    getMaturityScores(workspaceId),
  ]);

  // Cache-only read (lib/enrichment/index.ts#getWorkspaceMarketSignals) — never
  // hits BrasilAPI/IBGE here. Real lookups happen via enrichWorkspaceMarketSignals,
  // triggered explicitly (e.g. the enrich_company_context MCP tool).
  const marketSignals: MarketSignals | null = await getWorkspaceMarketSignals(
    workspaceId,
    bc.cnpj
  );

  return {
    workspaceId,
    businessContext: bc as Record<string, unknown>,
    brandContext: brand as Record<string, unknown>,
    maturityScores: scores,
    marketSignals: (marketSignals as Record<string, unknown> | null) ?? undefined,
  };
}
