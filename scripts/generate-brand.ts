import fs from 'fs';
import path from 'path';
import { invokeSkill } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';

const OUTPUT_PATH = path.join(process.cwd(), 'BRAND.md');

const businessContext = {
  produto: 'Flywell (nome de infra: GrowthOS) — plataforma de diagnóstico e orquestração de growth marketing para PMEs brasileiras',
  diferencial_real_validado:
    'Insights baseados em dados verificáveis (CNPJ via BrasilAPI, PIB/população via IBGE, SEO técnico via PageSpeed Insights, histórico de domínio via Wayback Machine) em vez de prosa genérica gerada por LLM sem grounding. Entregues por squads de agentes de IA clonados de autoridades reais (Al Ries, Marty Neumeier, Kevin Keller no branding; Byron Sharp, David Aaker etc.) — não um chatbot genérico. Resultado deve ler como consultoria de verdade, usável por um gestor não-técnico que precisa impressionar executivos.',
  mecanismo:
    'O produto expõe sua própria lógica de negócio como serviço/motor (servidor MCP, tools sobre workspace/diagnóstico/enriquecimento de dados) além de UI própria — arquitetura "motor que agentes chamam", não só uma tela fechada.',
  concorrentes: [
    'Groway360 — concorrente direto, mesma proposta central (diagnóstico de maturidade de growth via IA, "Groway Score™"), fechado, sem MCP, aparentemente 100% baseado em questionário autodeclarado sem dado externo real',
    'RD Station — IA própria (Mentor IA) mas fechada, usa só dado first-party da própria conta CRM do cliente',
    'HubSpot (Breeze) — dado real via Clearbit, mas cobertura fraca para PME fora dos EUA',
    'ActiveCampaign e agências/consultores de growth freelance — alternativa manual, sem escala nem dado de mercado verificado',
  ],
  publico_alvo:
    'Gestor de marketing/growth de PME ou mid-market brasileiro, não-técnico em growth (pode não saber o que é TAM/SAM/SOM ou CBBE), mas que precisa levar recomendações e resultados credíveis para diretoria/CEO.',
  conflito_de_nome_a_resolver:
    '"Flywell" é o nome usado em toda superfície visível ao usuário (título da página, sidebar, tela de login). "GrowthOS" é o nome usado em toda a infraestrutura (env vars como GROWTHOS_API_KEY, nome do servidor MCP, package.json, User-Agent enviado a APIs externas). Nenhum documento no repositório declara qual é o nome oficial — decisão nunca foi tomada conscientemente, só herdada de como o código foi escrito ao longo do tempo.',
};

const task = `Você é @brand-chief do brand-squad. O cliente desta rodada é a própria Flywell/GrowthOS — não um cliente externo, mas o produto que você mesmo faz parte. Rode, em sequência, *create-positioning, *build-identity, *map-archetype e *generate-names para a Flywell, usando o contexto de negócio abaixo como fonte de verdade.

Entregue a resposta em português, estruturada em markdown com exatamente estes 6 títulos de seção, nesta ordem:

## 1. Posicionamento
Statement de posicionamento claro (para quem é, qual categoria, qual diferencial, contra qual alternativa).

## 2. Tagline
Uma tagline curta que capture o posicionamento.

## 3. Arquétipo de marca
Qual arquétipo (ex: Sábio, Mago, Herói, Criador...) melhor representa a marca e por quê — justifique com base no diferencial real (dado verificável + squads de autoridades reais), não genericamente.

## 4. Voz e tom
Diretrizes de voz/tom com pelo menos 3 exemplos concretos de "faça" e 3 de "não faça" (frases reais, não abstrações).

## 5. Recomendação de nome
Decida entre manter "Flywell", manter "GrowthOS", ou propor um nome novo — com raciocínio explícito de @naming-strategist (memorabilidade, disponibilidade de domínio plausível, alinhamento com o posicionamento) e @domain-scout (viabilidade de domínio). Seja decisivo: dê uma recomendação clara, não uma lista de opções sem conclusão.

## 6. Manifesto
Um manifesto de marca completo, 2 a 4 parágrafos, não truncado, que poderia aparecer numa página "sobre" ou tela de login.

Restrição importante: o produto visualmente não usa dark mode, gradientes nem sombras decorativas — é um sistema visual sóbrio e institucional. A voz/tom e o manifesto não devem prometer ou sugerir algo mais "flashy" do que isso — a marca precisa ser coerente com um produto visualmente contido, não bombástico.`;

async function main() {
  const ctx = {
    workspaceId: 'flywell-self',
    businessContext,
  };

  console.error('[generate-brand] chamando brand-squad (pode levar de segundos a alguns minutos no free tier)...');

  const result = await invokeSkill('brand-squad', { task }, ctx, MODELS.advanced);

  if (!result.ok) {
    console.error('[generate-brand] falhou:', result.reason);
    process.exit(1);
  }

  const header = `---
generatedAt: ${new Date().toISOString()}
model: ${result.model}
skill: brand-squad
---

`;

  fs.writeFileSync(OUTPUT_PATH, header + result.content, 'utf-8');
  console.error(`[generate-brand] escrito em ${OUTPUT_PATH}`);
  console.log(result.content);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[generate-brand] failed:', err);
    process.exit(1);
  });
