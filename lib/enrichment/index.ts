import { enrichFromCnpj, normalizeCnpj } from './cnpj';
import { getRegionalContext } from './regional';
import { getDomainSeoSignalsLive, type DomainSeoSignals } from './domain-seo';
import { getCachedOrFetch } from './cache';
import type { MarketSignals } from './types';
import { upsertBusinessContext } from '@/lib/business-context/graph';

export type { MarketSignals, CnpjEnrichment, RegionalContext } from './types';
export type { DomainSeoSignals } from './domain-seo';
export { enrichFromCnpj, normalizeCnpj } from './cnpj';
export { getRegionalContext } from './regional';
export { getWorkspaceMarketSignals } from './read';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const CNPJ_PLATFORM = 'cnpj';
const IBGE_PLATFORM = 'ibge';
const SEO_PLATFORM = 'domain-seo';

// Runs the real external lookups (BrasilAPI + IBGE) and caches the result in
// platform_cache. This is the only function in lib/enrichment/ that should be
// called from a request/tool handler that's OK waiting on network calls —
// buildWorkspaceContext() only ever reads the cache (lib/enrichment/read.ts),
// so routine agent turns stay fast.
export async function enrichWorkspaceMarketSignals(
  workspaceId: string,
  cnpj: string
): Promise<MarketSignals> {
  const normalized = normalizeCnpj(cnpj);

  const cnpjData = await getCachedOrFetch(
    workspaceId,
    CNPJ_PLATFORM,
    normalized,
    () => enrichFromCnpj(normalized),
    THIRTY_DAYS_MS
  );

  const regional = cnpjData.codigoMunicipioIbge
    ? await getCachedOrFetch(
        workspaceId,
        IBGE_PLATFORM,
        String(cnpjData.codigoMunicipioIbge),
        () => getRegionalContext(cnpjData.codigoMunicipioIbge),
        NINETY_DAYS_MS
      )
    : undefined;

  // Without this, enrich_company_context writes to platform_cache but
  // buildWorkspaceContext() never finds it again on the next turn — it only
  // looks up the cache by the CNPJ in business_context.cnpj, which nothing
  // had ever set. Found via a live end-to-end run, not by inspection.
  await upsertBusinessContext(workspaceId, { cnpj: normalized });

  return { cnpj: cnpjData, regional, fetchedAt: new Date().toISOString() };
}

// Domain-keyed, not CNPJ-keyed or auto-surfaced in buildWorkspaceContext() —
// unlike enrichWorkspaceMarketSignals, this is meant to be called on demand
// for ANY domain (the workspace's own site or a named competitor's), so it
// can't be "the workspace's market signals" the way CNPJ/IBGE data is.
// 7-day cache: SEO/authority scores move faster than CNPJ registry data.
export async function getDomainSeoSignals(
  workspaceId: string,
  domain: string,
  url: string
): Promise<DomainSeoSignals> {
  return getCachedOrFetch(
    workspaceId,
    SEO_PLATFORM,
    domain,
    () => getDomainSeoSignalsLive(domain, url),
    SEVEN_DAYS_MS
  );
}
