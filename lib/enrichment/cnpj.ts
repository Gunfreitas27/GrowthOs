import type { CnpjEnrichment } from './types';

// BrasilAPI is a free, unauthenticated public proxy over Receita Federal's
// open CNPJ dataset (there is no official Receita Federal REST API).
// https://brasilapi.com.br/docs#tag/CNPJ
const BRASIL_API_BASE = 'https://brasilapi.com.br/api/cnpj/v1';

interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: { codigo: number; descricao: string }[];
  porte: string;
  capital_social: number;
  data_inicio_atividade: string;
  descricao_situacao_cadastral: string;
  municipio: string;
  uf: string;
  // The IBGE municipality code — distinct from `codigo_municipio`, which is
  // Receita Federal's own internal code and NOT usable against IBGE APIs.
  codigo_municipio_ibge: number;
}

export function normalizeCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) {
    throw new Error(`CNPJ inválido: "${cnpj}" (esperado 14 dígitos, recebido ${digits.length})`);
  }
  return digits;
}

export async function enrichFromCnpj(cnpj: string): Promise<CnpjEnrichment> {
  const digits = normalizeCnpj(cnpj);

  // BrasilAPI sits behind Vercel's bot mitigation, which blocks Node's
  // fetch() when it sends no User-Agent (curl works fine — it sends one by
  // default). A normal UA is enough to pass; this is identification, not
  // evasion.
  const res = await fetch(`${BRASIL_API_BASE}/${digits}`, {
    headers: { 'User-Agent': 'GrowthOS/0.1 (+https://growthOS.app)' },
  });
  if (!res.ok) {
    throw new Error(`BrasilAPI CNPJ lookup falhou (HTTP ${res.status}) para ${digits}`);
  }

  const data = (await res.json()) as BrasilApiCnpjResponse;

  return {
    cnpj: digits,
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia || null,
    cnae: { codigo: data.cnae_fiscal, descricao: data.cnae_fiscal_descricao },
    cnaesSecundarios: (data.cnaes_secundarios ?? []).map((c) => ({
      codigo: c.codigo,
      descricao: c.descricao,
    })),
    porte: data.porte,
    capitalSocial: data.capital_social,
    dataInicioAtividade: data.data_inicio_atividade,
    situacaoCadastral: data.descricao_situacao_cadastral,
    municipio: data.municipio,
    uf: data.uf,
    codigoMunicipioIbge: data.codigo_municipio_ibge,
  };
}
