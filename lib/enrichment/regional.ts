import type { RegionalContext } from './types';

// IBGE Agregados (SIDRA) API — free, unauthenticated, official.
// https://servicodados.ibge.gov.br/api/docs/agregados
const IBGE_AGREGADOS_BASE = 'https://servicodados.ibge.gov.br/api/v3/agregados';

// Tabela 6579 "População residente estimada", variável 9324.
const POPULACAO_TABELA = 6579;
const POPULACAO_VARIAVEL = 9324;

// Tabela 5938 "PIB dos Municípios", variável 37 = PIB a preços correntes (mil reais).
const PIB_TABELA = 5938;
const PIB_VARIAVEL = 37;

interface IbgeSeriesPoint {
  ano: string;
  valor: number;
  localidadeNome: string;
}

async function fetchLatestIbgeValue(
  tabela: number,
  variavel: number,
  municipioIbge: number
): Promise<IbgeSeriesPoint | null> {
  // `-1` = período mais recente disponível. Localidade nível N6 = município;
  // os colchetes precisam ir URL-encoded (%5B/%5D) ou a API retorna vazio.
  const url = `${IBGE_AGREGADOS_BASE}/${tabela}/periodos/-1/variaveis/${variavel}?localidades=N6%5B${municipioIbge}%5D`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = (await res.json()) as Array<{
    resultados: Array<{
      series: Array<{
        localidade: { nome: string };
        serie: Record<string, string>;
      }>;
    }>;
  }>;

  const serie = json[0]?.resultados[0]?.series[0];
  if (!serie) return null;

  const [ano, valorStr] = Object.entries(serie.serie)[0] ?? [];
  if (!ano || valorStr === undefined || valorStr === '...' || valorStr === '-') return null;

  return { ano, valor: Number(valorStr), localidadeNome: serie.localidade.nome };
}

export async function getRegionalContext(municipioIbge: number): Promise<RegionalContext> {
  const [populacao, pib] = await Promise.all([
    fetchLatestIbgeValue(POPULACAO_TABELA, POPULACAO_VARIAVEL, municipioIbge),
    fetchLatestIbgeValue(PIB_TABELA, PIB_VARIAVEL, municipioIbge),
  ]);

  const populacaoEstimada = populacao?.valor ?? null;
  const pibMilReais = pib?.valor ?? null;

  return {
    municipioIbge,
    municipioNome: populacao?.localidadeNome ?? pib?.localidadeNome ?? '',
    populacaoEstimada,
    populacaoAno: populacao?.ano ?? null,
    pibMilReais,
    pibAno: pib?.ano ?? null,
    pibPerCapitaReais:
      populacaoEstimada && pibMilReais ? (pibMilReais * 1000) / populacaoEstimada : null,
  };
}
