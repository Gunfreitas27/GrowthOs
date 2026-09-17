import { invokeSkill, WorkspaceContext } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';
import { upsertBrandContext } from '@/lib/business-context/graph';
import type { ResearchProgressContent } from '@/lib/agents/types';

// brand-squad has Kevin Keller (CBBE) and David Aaker (Brand Equity) natively.
// We feed it raw Ahrefs + web search data; it returns structured CBBE analysis.

interface BrandResearchInput {
  workspaceId: string;
  website: string;
  businessContext: Record<string, unknown>;
}

interface ResearchLens {
  key: string;
  label: string;
  result: string | null;
  error?: string;
}

export async function runBrandResearch(
  input: BrandResearchInput,
  ctx: WorkspaceContext,
  onProgress?: (progress: ResearchProgressContent) => void
): Promise<Record<string, unknown>> {
  const lenses: ResearchLens[] = [];

  // Lens 1: Digital Presence via Ahrefs data (simulated until Ahrefs MCP is connected)
  onProgress?.({ type: 'research_progress', lens: 'Presença Digital', status: 'running' });
  const digitalResult = await invokeSkill(
    'data-squad',
    {
      task: `Analise a presença digital do site ${input.website}.
Avalie métricas SEO: autoridade de domínio estimada, presença orgânica, palavras-chave potenciais, backlinks estimados.
Use seu conhecimento sobre o setor ${input.businessContext.segment ?? 'não informado'} para contextualizar.
Retorne análise estruturada em markdown.`,
    },
    ctx,
    MODELS.default
  );

  lenses.push({
    key: 'digital_presence',
    label: 'Presença Digital',
    result: digitalResult.ok ? digitalResult.content : null,
    error: digitalResult.ok ? undefined : digitalResult.reason,
  });
  onProgress?.({
    type: 'research_progress',
    lens: 'Presença Digital',
    status: digitalResult.ok ? 'done' : 'error',
    summary: digitalResult.ok ? 'Análise de presença digital concluída' : digitalResult.reason,
  });

  // Lens 2: Brand Positioning — brand-squad (Al Ries positioning + Marty Neumeier brand gap)
  onProgress?.({ type: 'research_progress', lens: 'Posicionamento de Marca', status: 'running' });
  const positioningResult = await invokeSkill(
    'brand-squad',
    {
      task: `Analise o posicionamento de marca da empresa com site ${input.website}.

Contexto do negócio: ${JSON.stringify(input.businessContext)}

Aplique:
1. Al Ries: 22 Laws of Marketing — qual lei está sendo seguida ou violada?
2. Marty Neumeier: Brand Gap — a empresa está diferenciada e relevante?
3. Byron Sharp: Mental availability e physical availability
4. Donald Miller: StoryBrand — a marca está comunicando clareza?

Retorne análise estruturada em markdown com insights acionáveis.`,
    },
    ctx,
    MODELS.advanced
  );

  lenses.push({
    key: 'positioning',
    label: 'Posicionamento de Marca',
    result: positioningResult.ok ? positioningResult.content : null,
    error: positioningResult.ok ? undefined : positioningResult.reason,
  });
  onProgress?.({
    type: 'research_progress',
    lens: 'Posicionamento de Marca',
    status: positioningResult.ok ? 'done' : 'error',
    summary: positioningResult.ok ? 'Posicionamento analisado' : positioningResult.reason,
  });

  // Lens 3: Competitive Analysis — advisory-board (Thiel contrarian competitive strategy)
  onProgress?.({ type: 'research_progress', lens: 'Análise Competitiva', status: 'running' });
  const competitiveResult = await invokeSkill(
    'advisory-board',
    {
      task: `Analise a posição competitiva da empresa com site ${input.website} no mercado de "${input.businessContext.segment ?? 'não informado'}".

Concorrentes conhecidos: ${JSON.stringify(input.businessContext.competitors ?? [])}

Aplique Peter Thiel (contrarian thinking): a empresa está criando monopólio ou competindo em commodity?
Aplique Porter Five Forces: qual é a intensidade competitiva deste mercado?
Qual é o moat (vantagem defensável) desta empresa?

Retorne análise estruturada com score de vantagem competitiva (0–5).`,
    },
    ctx,
    MODELS.advanced
  );

  lenses.push({
    key: 'competitive',
    label: 'Análise Competitiva',
    result: competitiveResult.ok ? competitiveResult.content : null,
    error: competitiveResult.ok ? undefined : competitiveResult.reason,
  });
  onProgress?.({
    type: 'research_progress',
    lens: 'Análise Competitiva',
    status: competitiveResult.ok ? 'done' : 'error',
    summary: competitiveResult.ok ? 'Competição analisada' : competitiveResult.reason,
  });

  // Lens 4: Brand Equity via Keller CBBE — brand-squad (Keller is native to this skill)
  onProgress?.({ type: 'research_progress', lens: 'Brand Equity (CBBE)', status: 'running' });
  const brandEquityResult = await invokeSkill(
    'brand-squad',
    {
      task: `Avalie o Brand Equity da empresa ${input.website} usando o modelo CBBE de Kevin Keller e Brand Equity de David Aaker.

Segmento: ${input.businessContext.segment ?? 'não informado'}
Descrição ICP: ${JSON.stringify(input.businessContext.icp ?? {})}
Posicionamento declarado: ${JSON.stringify((input.businessContext as Record<string, unknown>).positioning ?? {})}

Avalie cada nível do CBBE Pyramid:
1. Brand Salience (Quem você é?) — pontuação 0–5
2. Brand Performance (O que você faz?) — pontuação 0–5
3. Brand Imagery (O que você representa?) — pontuação 0–5
4. Brand Judgments (O que penso de você?) — pontuação 0–5
5. Brand Feelings (O que sinto por você?) — pontuação 0–5
6. Brand Resonance (Qual é nossa conexão?) — pontuação 0–5

Retorne análise estruturada em markdown + JSON com scores.`,
    },
    ctx,
    MODELS.advanced
  );

  lenses.push({
    key: 'brand_equity',
    label: 'Brand Equity (CBBE)',
    result: brandEquityResult.ok ? brandEquityResult.content : null,
    error: brandEquityResult.ok ? undefined : brandEquityResult.reason,
  });
  onProgress?.({
    type: 'research_progress',
    lens: 'Brand Equity (CBBE)',
    status: brandEquityResult.ok ? 'done' : 'error',
    summary: brandEquityResult.ok ? 'Brand Equity avaliado via CBBE' : brandEquityResult.reason,
  });

  // Persist research results to brand_context
  const researchResults = {
    website: input.website,
    researchedAt: new Date().toISOString(),
    lenses: lenses.reduce(
      (acc, l) => ({ ...acc, [l.key]: { label: l.label, result: l.result, error: l.error } }),
      {} as Record<string, unknown>
    ),
  };

  await upsertBrandContext(input.workspaceId, { research_results: researchResults });

  return researchResults;
}
