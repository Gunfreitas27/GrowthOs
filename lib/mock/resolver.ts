import {
  MOCK_BUSINESS_CONTEXT,
  MOCK_BRAND_CONTEXT,
  MOCK_MATURITY_SCORES,
  MOCK_MATURITY_SCORES_DETAILED,
  MOCK_VISIBLE_MODULES,
} from './data';

export { MOCK_BUSINESS_CONTEXT, MOCK_MATURITY_SCORES };
export const IS_MOCK = process.env.USE_MOCK_DATA === 'true';

export async function resolveMaturityScores(_workspaceId: string) {
  if (IS_MOCK) return MOCK_MATURITY_SCORES;
  const { getMaturityScores } = await import('@/lib/business-context/graph');
  return getMaturityScores(_workspaceId);
}

export async function resolveMaturityScoresDetailed(_workspaceId: string) {
  if (IS_MOCK) return MOCK_MATURITY_SCORES_DETAILED;
  const { getMaturityScoresDetailed } = await import('@/lib/business-context/graph');
  return getMaturityScoresDetailed(_workspaceId);
}

export async function resolveVisibleModules(_workspaceId: string) {
  if (IS_MOCK) return MOCK_VISIBLE_MODULES;
  const { db, moduleStates } = await import('@/lib/db');
  const { and, eq, ne } = await import('drizzle-orm');
  return db.query.moduleStates.findMany({
    where: and(eq(moduleStates.workspaceId, _workspaceId), ne(moduleStates.status, 'hidden')),
    columns: { moduleKey: true, status: true },
  });
}

export async function resolveBusinessContext(_workspaceId: string) {
  if (IS_MOCK) return MOCK_BUSINESS_CONTEXT;
  const { getBusinessContext } = await import('@/lib/business-context/graph');
  return getBusinessContext(_workspaceId);
}

export async function resolveConnections(_workspaceId: string) {
  if (IS_MOCK) return [];
  const { db, mcpConnections } = await import('@/lib/db');
  const { eq } = await import('drizzle-orm');
  return db.query.mcpConnections.findMany({
    where: eq(mcpConnections.workspaceId, _workspaceId),
    columns: { platform: true, status: true, lastSync: true },
  });
}

export async function resolveApiKeys(_workspaceId: string) {
  if (IS_MOCK) return [];
  const { db, workspaceApiKeys } = await import('@/lib/db');
  const { eq, isNull, and, desc } = await import('drizzle-orm');
  return db.query.workspaceApiKeys.findMany({
    where: and(eq(workspaceApiKeys.workspaceId, _workspaceId), isNull(workspaceApiKeys.revokedAt)),
    orderBy: (t) => [desc(t.createdAt)],
    columns: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
  });
}

export async function resolveBrandContext(_workspaceId: string) {
  if (IS_MOCK) return MOCK_BRAND_CONTEXT;
  const { getBrandContext } = await import('@/lib/business-context/graph');
  return getBrandContext(_workspaceId);
}
