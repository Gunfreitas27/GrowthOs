import { db, platformCache } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

// platform_cache existed in the schema since Fase 0 but was never wired to
// any code — this is its first real use, as a cache for external
// market-enrichment lookups (CNPJ, IBGE) so buildWorkspaceContext() can read
// market signals without ever making an external HTTP call itself.

export async function getCachedOrFetch<T>(
  workspaceId: string,
  platform: string,
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const existing = await db.query.platformCache.findFirst({
    where: and(
      eq(platformCache.workspaceId, workspaceId),
      eq(platformCache.platform, platform),
      eq(platformCache.cacheKey, cacheKey)
    ),
  });

  if (existing && existing.expiresAt.getTime() > Date.now()) {
    return existing.data as T;
  }

  const data = await fetcher();

  await db
    .insert(platformCache)
    .values({
      workspaceId,
      platform,
      cacheKey,
      data: data as Record<string, unknown>,
      expiresAt: new Date(Date.now() + ttlMs),
    })
    .onConflictDoUpdate({
      target: [platformCache.workspaceId, platformCache.platform, platformCache.cacheKey],
      set: { data: data as Record<string, unknown>, expiresAt: new Date(Date.now() + ttlMs) },
    });

  return data;
}

export async function getCached<T>(
  workspaceId: string,
  platform: string,
  cacheKey: string
): Promise<T | null> {
  const existing = await db.query.platformCache.findFirst({
    where: and(
      eq(platformCache.workspaceId, workspaceId),
      eq(platformCache.platform, platform),
      eq(platformCache.cacheKey, cacheKey)
    ),
  });

  if (!existing || existing.expiresAt.getTime() <= Date.now()) return null;
  return existing.data as T;
}
