import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  buildWorkspaceContext,
  getBusinessContext,
  getBrandContext,
  getMaturityScores,
} from '@/lib/business-context/graph';
import { runMaturityScoring } from '@/lib/maturity/scorer';
import { runBrandResearch } from '@/lib/agents/brand-research-skill';
import { askAdvisoryBoard, type AdvisoryBoardTurn } from '@/lib/agents/ask-advisory-board';
import { enrichWorkspaceMarketSignals, getDomainSeoSignals } from '@/lib/enrichment';
import { SKILL_NAMES } from '@/lib/skills/runner';
import { submitOnboardingSection } from '@/lib/onboarding/submit';

// Each tool is a thin wrapper around an existing lib/ business-logic function —
// no logic lives here beyond composing the same calls the Next.js API routes
// already make (see app/api/maturity/score/route.ts and
// app/api/brand-research/route.ts for the patterns mirrored below).
// Deliberately NOT wired to lib/mock/resolver.ts: this server always talks to
// the real Postgres/OpenRouter, so a connected agent is proof the business
// logic works standalone, not a demo of the mock mode.
//
// workspaceId is NOT a tool argument. One server process is authenticated to
// exactly one workspace at startup (see stdio.ts — GROWTHOS_API_KEY resolves
// it server-side via lib/auth/api-keys.ts) and every tool closes over that
// single, trusted value. A tool argument would let any caller who can invoke
// these tools pass any workspace's UUID and read/write its data — that gap
// is exactly what the API-key model exists to close.

function textResult(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: 'text' as const, text }] };
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

export function registerTools(server: McpServer, workspaceId: string): void {
  server.registerTool(
    'get_workspace_context',
    {
      title: 'Get workspace context',
      description:
        'Returns the full business context for this workspace: business_context (ICP, TAM/SAM/SOM, channels, competitors...), brand_context (positioning, voice, research results), current growth maturity scores, and real market signals (CNPJ/IBGE, when enriched). This is the same context object injected into every AI agent/skill call.',
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      try {
        return textResult(await buildWorkspaceContext(workspaceId));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'get_maturity_scores',
    {
      title: 'Get growth maturity scores',
      description:
        'Returns the current growth maturity scores (0-5) per dimension for this workspace: awareness_posicionamento, aquisicao_paga, organico_conteudo, crm_lifecycle, analytics_atribuicao, diferenciacao_competitiva, comunidade_movimento.',
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      try {
        return textResult(await getMaturityScores(workspaceId));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'run_maturity_scoring',
    {
      title: 'Run growth maturity scoring',
      description:
        'Runs the GrowthOS maturity diagnostic for this workspace: invokes the data-squad and brand-squad AI skills against the workspace\'s saved business/brand context, then persists updated scores (0-5) per dimension to maturity_scores. Mirrors POST /api/maturity/score.',
      inputSchema: {},
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async () => {
      try {
        const [ctx, businessContext, brandContext] = await Promise.all([
          buildWorkspaceContext(workspaceId),
          getBusinessContext(workspaceId),
          getBrandContext(workspaceId),
        ]);

        const scores = await runMaturityScoring(
          workspaceId,
          {
            questionnaire: businessContext as Record<string, unknown>,
            brandResearch: (brandContext as Record<string, unknown>).research_results as
              | Record<string, unknown>
              | undefined,
          },
          ctx
        );

        return textResult(scores);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'ask_advisory_board',
    {
      title: 'Ask the GrowthOS advisory board',
      description:
        'Asks the GrowthOS advisory-board skill (a squad of strategist personas: Ray Dalio, Peter Thiel, Kevin Keller...) a question, grounded in this workspace\'s business context, brand context, maturity scores and real market signals. Single-shot: does not persist to the workspace\'s chat history and does not trigger module unlocks.',
      inputSchema: {
        message: z.string().min(1).describe('The question or task for the advisory board'),
        conversationHistory: z
          .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
          .optional()
          .describe('Optional prior turns, oldest first, to keep multi-turn context'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ message, conversationHistory }) => {
      try {
        const { answer } = await askAdvisoryBoard(
          workspaceId,
          message,
          (conversationHistory as AdvisoryBoardTurn[] | undefined) ?? []
        );
        return textResult(answer);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'enrich_company_context',
    {
      title: 'Enrich company context with real market data',
      description:
        'Looks up this workspace\'s company by CNPJ against BrasilAPI (Receita Federal registry data: CNAE, porte, capital social, endereço) and IBGE (município population and GDP), and caches the result (platform_cache, 30-90 day TTL). Subsequent buildWorkspaceContext() calls include this as marketSignals, grounding maturity scoring and advisory-board answers in verified facts instead of self-reported/LLM-guessed data. Free, unauthenticated public APIs — no cost.',
      inputSchema: {
        cnpj: z.string().min(14).describe('Company CNPJ, digits only or formatted (e.g. 19.131.243/0001-97)'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ cnpj }) => {
      try {
        const signals = await enrichWorkspaceMarketSignals(workspaceId, cnpj);
        return textResult(signals);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'check_domain_seo_signals',
    {
      title: 'Check free SEO/authority signals for a domain',
      description:
        'Free replacement for the "Ahrefs" data brand-research-skill used to simulate (see lib/agents/brand-research-skill.ts): looks up any domain\'s technical SEO score (Google PageSpeed Insights, Lighthouse "seo" category), domain authority proxy (OpenPageRank, 0-10), and site-archival history (Wayback Machine, oldest snapshot). Works for the workspace\'s own site or a named competitor\'s. Does NOT replace real backlink lists, keyword rankings, or traffic estimates — that gap stays open until there\'s budget for a paid tool. PageSpeed/OpenPageRank need API keys (GOOGLE_PAGESPEED_API_KEY, OPENPAGERANK_API_KEY) — missing keys degrade individual fields to null rather than failing the whole call (see `errors` in the result).',
      inputSchema: {
        domain: z.string().min(1).describe('Bare domain, e.g. "concorrente.com.br" (no https://, no path)'),
        url: z.string().url().describe('Full URL to run the PageSpeed check against, e.g. "https://concorrente.com.br"'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain, url }) => {
      try {
        const signals = await getDomainSeoSignals(workspaceId, domain, url);
        return textResult(signals);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'list_available_skills',
    {
      title: 'List available agent skills',
      description:
        'Lists the persona-based AI skills available to invoke (advisory-board, data-squad, brand-squad...). Each is a system-prompt bundle simulating a squad of expert personas — see mcp-server/README.md and the "Motor GrowthOS" report for what "skill" means in this codebase (no structured tool-calling inside them, just prompt engineering).',
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => textResult(SKILL_NAMES)
  );

  server.registerTool(
    'submit_onboarding_answers',
    {
      title: 'Submit onboarding section answers',
      description:
        'Submits answers for one onboarding section (empresa, cliente, posicionamento, competicao, growth) for this workspace, mapping them into business_context — the same mapping app/(app)/onboarding/page.tsx uses. When the "empresa" section includes a website, brand research is triggered automatically; when all 5 sections are complete, maturity scoring is triggered automatically. Both run as fire-and-forget background work — poll get_maturity_scores / get_workspace_context afterward to see results.',
      inputSchema: {
        sectionKey: z
          .enum(['empresa', 'cliente', 'posicionamento', 'competicao', 'growth'])
          .describe('Which onboarding section these answers belong to'),
        answers: z
          .record(z.string(), z.union([z.string(), z.array(z.string())]))
          .describe('Question key → answer, matching lib/onboarding/sections.ts field names for this section'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ sectionKey, answers }) => {
      try {
        const result = await submitOnboardingSection({ workspaceId, sectionKey, answers });
        return textResult(result);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    'run_brand_research',
    {
      title: 'Run brand research',
      description:
        'Runs the GrowthOS multi-lens brand research for this workspace\'s website: digital presence, brand positioning, competitive analysis and CBBE brand equity, each via a dedicated AI skill. Persists results to brand_context.research_results. Mirrors POST /api/brand-research. Slowest tool (4 sequential LLM calls) — expect ~30-60s.',
      inputSchema: {
        website: z.string().url().describe('Full URL of the company website to research'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ website }) => {
      try {
        const [ctx, businessContext] = await Promise.all([
          buildWorkspaceContext(workspaceId),
          getBusinessContext(workspaceId),
        ]);

        const results = await runBrandResearch(
          { workspaceId, website, businessContext: businessContext as Record<string, unknown> },
          ctx
        );

        return textResult(results);
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}
