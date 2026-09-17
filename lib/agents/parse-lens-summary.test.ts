import { describe, it, expect } from 'vitest';
import { parseLensSummary } from './parse-lens-summary';

describe('parseLensSummary', () => {
  it('extracts headline, metric and bullets from a well-formed Resumo block', () => {
    const raw = `## Resumo
**Manchete:** Orgânico está 40% abaixo do mínimo competitivo do setor.
**Métrica-chave:** DR estimado: 42
- Crescimento orgânico de +18% MoM
- 320 keywords indexadas
- Abaixo do DR mínimo competitivo (55+)

## Análise Completa

### Autoridade de Domínio
Texto detalhado aqui...`;

    const result = parseLensSummary(raw);

    expect(result.headline).toBe('Orgânico está 40% abaixo do mínimo competitivo do setor.');
    expect(result.metric).toBe('DR estimado: 42');
    expect(result.bullets).toEqual([
      'Crescimento orgânico de +18% MoM',
      '320 keywords indexadas',
      'Abaixo do DR mínimo competitivo (55+)',
    ]);
    expect(result.fullReport).toContain('### Autoridade de Domínio');
    expect(result.fullReport).not.toContain('**Manchete:**');
  });

  it('falls back to the raw content as fullReport when no Resumo block exists', () => {
    const raw = '## Análise\nTexto sem bloco de resumo estruturado.';

    const result = parseLensSummary(raw);

    expect(result.headline).toBeNull();
    expect(result.metric).toBeNull();
    expect(result.bullets).toEqual([]);
    expect(result.fullReport).toBe(raw);
  });

  it('returns empty fullReport for null/undefined input', () => {
    expect(parseLensSummary(null)).toEqual({ headline: null, metric: null, bullets: [], fullReport: '' });
    expect(parseLensSummary(undefined)).toEqual({ headline: null, metric: null, bullets: [], fullReport: '' });
  });

  it('tolerates a Resumo block missing the metric line', () => {
    const raw = `## Resumo
**Manchete:** Só manchete, sem métrica.
- Um bullet só

## Detalhe
Resto do relatório.`;

    const result = parseLensSummary(raw);

    expect(result.headline).toBe('Só manchete, sem métrica.');
    expect(result.metric).toBeNull();
    expect(result.bullets).toEqual(['Um bullet só']);
    expect(result.fullReport).toContain('Resto do relatório.');
  });
});
