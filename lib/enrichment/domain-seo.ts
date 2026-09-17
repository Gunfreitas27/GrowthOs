import { getPageSpeedSeoScore } from './pagespeed';
import { getDomainAuthority } from './domain-authority';
import { getWaybackHistory } from './wayback';

export interface DomainSeoSignals {
  domain: string;
  seoScore: number | null; // PageSpeed Insights, Lighthouse "seo" category, 0-100
  domainAuthority: number | null; // OpenPageRank, 0-10
  firstSnapshotDate: string | null; // Wayback Machine, oldest archive.org snapshot
  fetchedAt: string;
  errors: string[]; // which of the 3 sources failed and why — partial results are expected
}

// Free replacement for the "Ahrefs" digital-presence data brand-research-skill
// used to simulate (see lib/agents/brand-research-skill.ts:29's "simulated
// until Ahrefs MCP is connected" comment): none of these three individually
// replicate Ahrefs (no real backlink list, no keyword rankings, no traffic
// estimate — that gap is real and stays open until there's budget), but
// together they replace LLM-hallucinated "digital presence" with three
// independently-verifiable facts about ANY domain, including competitors'.
//
// Promise.allSettled, not Promise.all: PageSpeed/OpenPageRank need API keys
// that may not be configured yet, and Wayback is a flaky public service
// (observed failing outright while building this) — one source being down
// should degrade the result, not fail the whole lookup.
export async function getDomainSeoSignalsLive(domain: string, url: string): Promise<DomainSeoSignals> {
  const [pagespeed, authority, wayback] = await Promise.allSettled([
    getPageSpeedSeoScore(url),
    getDomainAuthority(domain),
    getWaybackHistory(domain),
  ]);

  const errors: string[] = [];
  if (pagespeed.status === 'rejected') errors.push(`pagespeed: ${pagespeed.reason?.message ?? pagespeed.reason}`);
  if (authority.status === 'rejected') errors.push(`domain_authority: ${authority.reason?.message ?? authority.reason}`);
  if (wayback.status === 'rejected') errors.push(`wayback: ${wayback.reason?.message ?? wayback.reason}`);

  return {
    domain,
    seoScore: pagespeed.status === 'fulfilled' ? pagespeed.value.seoScore : null,
    domainAuthority: authority.status === 'fulfilled' ? authority.value.pageRankDecimal : null,
    firstSnapshotDate: wayback.status === 'fulfilled' ? wayback.value.firstSnapshotDate : null,
    fetchedAt: new Date().toISOString(),
    errors,
  };
}
