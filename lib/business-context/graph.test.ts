import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));
  return {
    db: {
      insert,
      query: {
        businessContext: { findFirst: vi.fn() },
        brandContext: { findFirst: vi.fn() },
        maturityScores: { findMany: vi.fn() },
      },
    },
    businessContext: { workspaceId: 'workspaceId' },
    brandContext: { workspaceId: 'workspaceId' },
    maturityScores: { workspaceId: 'workspaceId', dimension: 'dimension' },
  };
});

vi.mock('@/lib/enrichment', () => ({
  getWorkspaceMarketSignals: vi.fn().mockResolvedValue(null),
}));

import { db } from '@/lib/db';
import { getBusinessContext, upsertBusinessContext, getMaturityScores } from './graph';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getBusinessContext', () => {
  it('returns an empty object when no row exists', async () => {
    vi.mocked(db.query.businessContext.findFirst).mockResolvedValueOnce(undefined);
    expect(await getBusinessContext('ws-1')).toEqual({});
  });

  it('returns the stored data when a row exists', async () => {
    vi.mocked(db.query.businessContext.findFirst).mockResolvedValueOnce({
      data: { segment: 'B2B SaaS' },
    } as never);
    expect(await getBusinessContext('ws-1')).toEqual({ segment: 'B2B SaaS' });
  });
});

describe('upsertBusinessContext', () => {
  it('shallow-merges the patch onto existing data instead of replacing it', async () => {
    vi.mocked(db.query.businessContext.findFirst).mockResolvedValueOnce({
      data: { segment: 'B2B SaaS', website: 'https://a.com' },
    } as never);

    const merged = await upsertBusinessContext('ws-1', { website: 'https://b.com' });

    // segment sobrevive ao patch parcial — não é sobrescrito por undefined
    expect(merged).toEqual({ segment: 'B2B SaaS', website: 'https://b.com' });
  });

  it('persists the merged object (not just the patch) to the DB', async () => {
    vi.mocked(db.query.businessContext.findFirst).mockResolvedValueOnce({
      data: { segment: 'B2B SaaS' },
    } as never);

    await upsertBusinessContext('ws-1', { cnpj: '19131243000197' });

    const insertResult = vi.mocked(db.insert).mock.results[0].value;
    expect(insertResult.values).toHaveBeenCalledWith({
      workspaceId: 'ws-1',
      data: { segment: 'B2B SaaS', cnpj: '19131243000197' },
    });
  });

  it('works from an empty starting context (first onboarding save)', async () => {
    vi.mocked(db.query.businessContext.findFirst).mockResolvedValueOnce(undefined);

    const merged = await upsertBusinessContext('ws-1', { segment: 'Fintech' });

    expect(merged).toEqual({ segment: 'Fintech' });
  });
});

describe('getMaturityScores', () => {
  it('turns rows into a dimension→score record', async () => {
    vi.mocked(db.query.maturityScores.findMany).mockResolvedValueOnce([
      { dimension: 'awareness_posicionamento', score: 3 },
      { dimension: 'aquisicao_paga', score: 1.5 },
    ] as never);

    expect(await getMaturityScores('ws-1')).toEqual({
      awareness_posicionamento: 3,
      aquisicao_paga: 1.5,
    });
  });

  it('returns an empty record when there are no scores yet', async () => {
    vi.mocked(db.query.maturityScores.findMany).mockResolvedValueOnce([]);
    expect(await getMaturityScores('ws-1')).toEqual({});
  });
});
