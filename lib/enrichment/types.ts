export interface CnpjEnrichment {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnae: { codigo: number; descricao: string };
  cnaesSecundarios: { codigo: number; descricao: string }[];
  porte: string;
  capitalSocial: number;
  dataInicioAtividade: string;
  situacaoCadastral: string;
  municipio: string;
  uf: string;
  codigoMunicipioIbge: number;
}

export interface RegionalContext {
  municipioIbge: number;
  municipioNome: string;
  populacaoEstimada: number | null;
  populacaoAno: string | null;
  pibMilReais: number | null;
  pibAno: string | null;
  pibPerCapitaReais: number | null;
}

export interface MarketSignals {
  cnpj?: CnpjEnrichment;
  regional?: RegionalContext;
  fetchedAt: string;
}
