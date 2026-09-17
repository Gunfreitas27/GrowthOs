export interface DomainAuthoritySignal {
  pageRankDecimal: number | null; // 0-10, PageRank-style domain authority proxy
}

// OpenPageRank (Domcop) migrated to "Keywords Everywhere" in Sept 2026.
// Confirmed live on 2026-09-16 by visiting the actual site (not assumed from
// training data, which predates this): domcop.com/openpagerank now redirects
// to openpagerank.keywordseverywhere.com, and getting an API key requires
// installing the Keywords Everywhere browser extension (Chrome/Firefox/Edge)
// to generate a free "Keywords Everywhere key" first, then signing in at
// openpagerank.keywordseverywhere.com/dashboard to mint a separate OPR key —
// there is no email-only signup anymore. Deliberately deprioritized (user
// decision, 2026-09-16): PageSpeed + Wayback already cover 2 of 3 free
// signals, and this was always the least-certain of the three.
//
// Request shape below (base URL, endpoint, bearer auth) is confirmed from
// the site's own published curl example. Response field names are NOT
// verified against a real call — no key was obtained. If/when
// OPENPAGERANK_API_KEY is set, treat the first real response as the source
// of truth and adjust the parsing below if `page_rank_decimal` isn't right.
export async function getDomainAuthority(domain: string): Promise<DomainAuthoritySignal> {
  const apiKey = process.env.OPENPAGERANK_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENPAGERANK_API_KEY não configurada — requer instalar a extensão Keywords Everywhere ' +
        '(keywordseverywhere.com) para gerar uma chave, depois criar uma OPR key em ' +
        'openpagerank.keywordseverywhere.com/dashboard.'
    );
  }

  const res = await fetch('https://openpagerank.keywordseverywhere.com/v1/domains/bulk', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domains: [domain], include_history: false }),
  });
  if (!res.ok) {
    throw new Error(`OpenPageRank lookup falhou (HTTP ${res.status}) para ${domain}`);
  }

  const data = (await res.json()) as {
    domains?: Array<{ domain?: string; page_rank_decimal?: number | string; score?: number | string }>;
  };

  const result = data.domains?.find((d) => d.domain === domain) ?? data.domains?.[0];
  const raw = result?.page_rank_decimal ?? result?.score;
  return { pageRankDecimal: raw !== undefined ? Number(raw) : null };
}
