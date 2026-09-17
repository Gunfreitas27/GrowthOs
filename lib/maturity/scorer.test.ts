import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clampScore } from './scorer';

describe('clampScore', () => {
  it('clamps above 5 down to 5', () => {
    expect(clampScore(7)).toBe(5);
  });
  it('clamps negative values to 0', () => {
    expect(clampScore(-2)).toBe(0);
  });
  it('passes through in-range values unchanged', () => {
    expect(clampScore(3.2)).toBe(3.2);
  });
  it('treats NaN as 0 rather than propagating it', () => {
    expect(clampScore(NaN)).toBe(0);
  });
  it('keeps exact boundary values', () => {
    expect(clampScore(0)).toBe(0);
    expect(clampScore(5)).toBe(5);
  });
});

vi.mock('@/lib/skills/runner', () => ({
  invokeSkill: vi.fn(),
}));
vi.mock('@/lib/db', () => {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));
  return { db: { insert }, maturityScores: { workspaceId: 'workspaceId', dimension: 'dimension' } };
});

import { invokeSkill } from '@/lib/skills/runner';
import { db } from '@/lib/db';
import { runMaturityScoring } from './scorer';

const mockCtx = { workspaceId: 'ws-1' };

describe('runMaturityScoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores a dimension name the LLM invented, keeping the known ones', async () => {
    vi.mocked(invokeSkill)
      .mockResolvedValueOnce({
        ok: true,
        content: JSON.stringify([
          { dimension: 'awareness_posicionamento', score: 3, rationale: 'x' },
          { dimension: 'dimensao_que_nao_existe', score: 4, rationale: 'y' },
        ]),
        skill: 'data-squad',
        model: 'm',
      })
      .mockResolvedValueOnce({ ok: false, reason: 'brand-squad indisponível', skill: 'brand-squad' });

    const result = await runMaturityScoring('ws-1', { questionnaire: {} }, mockCtx);

    expect(result).toEqual({ awareness_posicionamento: 3 });
    // só a dimensão válida foi persistida — não a inventada pelo LLM
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('never throws on malformed JSON from either skill, and persists nothing', async () => {
    vi.mocked(invokeSkill)
      .mockResolvedValueOnce({ ok: true, content: 'isto não é JSON', skill: 'data-squad', model: 'm' })
      .mockResolvedValueOnce({ ok: true, content: '{ainda não}', skill: 'brand-squad', model: 'm' });

    const result = await runMaturityScoring('ws-1', { questionnaire: {} }, mockCtx);

    expect(result).toEqual({});
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('clamps an out-of-range score before both persisting and returning it', async () => {
    vi.mocked(invokeSkill)
      .mockResolvedValueOnce({
        ok: true,
        content: JSON.stringify([{ dimension: 'aquisicao_paga', score: 99, rationale: 'x' }]),
        skill: 'data-squad',
        model: 'm',
      })
      .mockResolvedValueOnce({ ok: false, reason: 'down', skill: 'brand-squad' });

    const result = await runMaturityScoring('ws-1', { questionnaire: {} }, mockCtx);

    expect(result).toEqual({ aquisicao_paga: 5 });
  });
});
