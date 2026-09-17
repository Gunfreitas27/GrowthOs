export interface WaybackSignal {
  firstSnapshotDate: string | null; // ISO date (yyyy-mm-dd)
  archived: boolean;
}

// Wayback Machine CDX API — free, no key, no signup. Observed slow/flaky in
// practice (public infra, sometimes overloaded) — treated as a soft signal:
// times out and fails quietly rather than throwing, since it's the weakest
// of the three SEO-replacement signals and shouldn't block the other two.
export async function getWaybackHistory(domain: string): Promise<WaybackSignal> {
  const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { firstSnapshotDate: null, archived: false };

    const rows = (await res.json()) as string[][];
    // rows[0] is the header (["timestamp"]); rows[1] is the earliest snapshot, if any.
    if (rows.length < 2) return { firstSnapshotDate: null, archived: false };

    const ts = rows[1][0]; // format: YYYYMMDDhhmmss
    const firstSnapshotDate = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
    return { firstSnapshotDate, archived: true };
  } catch {
    return { firstSnapshotDate: null, archived: false };
  } finally {
    clearTimeout(timeoutId);
  }
}
