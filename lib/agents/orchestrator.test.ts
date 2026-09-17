import { describe, it, expect } from 'vitest';
import { computeAverageScore, meetsUnlockThreshold } from './orchestrator';

describe('computeAverageScore', () => {
  it('returns 0 for an empty scores object', () => {
    expect(computeAverageScore({})).toBe(0);
  });

  it('averages all dimension scores', () => {
    expect(computeAverageScore({ a: 2, b: 4 })).toBe(3);
  });

  it('handles a single dimension', () => {
    expect(computeAverageScore({ a: 3.5 })).toBe(3.5);
  });
});

describe('meetsUnlockThreshold', () => {
  it('unlocks strategy (threshold 1) once any maturity data exists', () => {
    expect(meetsUnlockThreshold('strategy', { awareness_posicionamento: 1 })).toBe(true);
  });

  it('does not unlock strategy with all-zero scores', () => {
    expect(meetsUnlockThreshold('strategy', { awareness_posicionamento: 0 })).toBe(false);
  });

  it('does not unlock paid (threshold 2) below the threshold', () => {
    expect(meetsUnlockThreshold('paid', { aquisicao_paga: 1.5 })).toBe(false);
  });

  it('unlocks paid (threshold 2) at exactly the threshold', () => {
    expect(meetsUnlockThreshold('paid', { aquisicao_paga: 2 })).toBe(true);
  });

  it('requires the highest threshold (3) for community/outbound', () => {
    expect(meetsUnlockThreshold('community', { a: 2, b: 2.9 })).toBe(false);
    expect(meetsUnlockThreshold('community', { a: 3, b: 3 })).toBe(true);
  });

  it('never unlocks any module with no maturity data at all', () => {
    for (const moduleKey of ['strategy', 'branding', 'paid', 'seo', 'crm', 'analytics', 'outbound', 'community', 'project', 'integrations'] as const) {
      expect(meetsUnlockThreshold(moduleKey, {})).toBe(false);
    }
  });
});
