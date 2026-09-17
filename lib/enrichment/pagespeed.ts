export interface PageSpeedSeoSignal {
  seoScore: number | null; // 0-100, from the Lighthouse "seo" category
}

// Google PageSpeed Insights API — free with a Google Cloud API key (no
// billing needed), 25k requests/day. Anonymous (no key) access exists but is
// backed by a shared daily quota that's usually already exhausted — verified
// live on 2026-09-16 (HTTP 429 "Quota exceeded... for consumer" with no key
// at all). A key is effectively required for this to work reliably.
export async function getPageSpeedSeoScore(url: string): Promise<PageSpeedSeoSignal> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  const params = new URLSearchParams({ url, category: 'seo', strategy: 'mobile' });
  if (apiKey) params.set('key', apiKey);

  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PageSpeed Insights lookup falhou (HTTP ${res.status}) para ${url}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    lighthouseResult?: { categories?: { seo?: { score?: number } } };
  };

  const raw = data.lighthouseResult?.categories?.seo?.score;
  return { seoScore: typeof raw === 'number' ? Math.round(raw * 100) : null };
}
