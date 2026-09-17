import { getCached } from './cache';
import type { MarketSignals } from './types';

const CNPJ_PLATFORM = 'cnpj';
const IBGE_PLATFORM = 'ibge';

// Cache-only read for buildWorkspaceContext() — never calls an external API.
// Split into its own file (not index.ts) so lib/business-context/graph.ts can
// import just this, without pulling in enrichWorkspaceMarketSignals — which
// itself needs to call back into graph.ts (upsertBusinessContext), and a
// graph.ts -> enrichment/index.ts -> graph.ts cycle is exactly what this
// split avoids.
export async function getWorkspaceMarketSignals(
  workspaceId: string,
  cnpj: string | undefined
): Promise<MarketSignals | null> {
  if (!cnpj) return null;

  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return null;

  const cnpjData = await getCached<MarketSignals['cnpj']>(workspaceId, CNPJ_PLATFORM, digits);
  if (!cnpjData) return null;

  const regional = cnpjData.codigoMunicipioIbge
    ? await getCached<MarketSignals['regional']>(
        workspaceId,
        IBGE_PLATFORM,
        String(cnpjData.codigoMunicipioIbge)
      )
    : undefined;

  return { cnpj: cnpjData, regional: regional ?? undefined, fetchedAt: new Date().toISOString() };
}
