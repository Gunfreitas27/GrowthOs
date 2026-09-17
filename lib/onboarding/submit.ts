import {
  upsertBusinessContext,
  buildWorkspaceContext,
  getBusinessContext,
  getBrandContext,
} from '@/lib/business-context/graph';
import { db, onboardingState } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { runBrandResearch } from '@/lib/agents/brand-research-skill';
import { runMaturityScoring } from '@/lib/maturity/scorer';
import { estimateMarketSizing } from '@/lib/business-context/estimate-market-sizing';
import { generateExecutiveSummary } from '@/lib/agents/generate-executive-summary';
import { checkAndUnlockModules } from '@/lib/agents/orchestrator';

// Shared by app/api/onboarding/section/route.ts (browser) and the
// submit_onboarding_answers MCP tool (agents) — the answer→business_context
// mapping and trigger logic used to live only inside the HTTP route.

const STAGE_MAP: Record<string, string> = {
  'Pré-receita': 'pre_revenue',
  'Early stage': 'early',
  Crescimento: 'growth',
  Escala: 'scale',
  Maturidade: 'mature',
};

const ALL_SECTIONS = ['empresa', 'cliente', 'posicionamento', 'competicao', 'growth'];

export interface SubmitOnboardingSectionInput {
  workspaceId: string;
  sectionKey: string;
  answers: Record<string, string | string[]>;
}

export interface SubmitOnboardingSectionResult {
  sectionKey: string;
  triggeredResearch: boolean;
  triggeredScoring: boolean;
}

export async function submitOnboardingSection(
  input: SubmitOnboardingSectionInput
): Promise<SubmitOnboardingSectionResult> {
  const { workspaceId, sectionKey, answers } = input;

  const patch: Record<string, unknown> = {};

  if (sectionKey === 'empresa') {
    if (answers.segment) patch.segment = answers.segment;
    if (answers.stage) patch.stage = STAGE_MAP[answers.stage as string] ?? answers.stage;
    if (answers.website) patch.website = answers.website;
    // tam_sam_som is no longer asked — the AI estimates it once onboarding
    // completes (estimateMarketSizing below), a non-technical owner/manager
    // shouldn't be expected to know their own TAM/SAM/SOM.
  }

  if (sectionKey === 'cliente') {
    patch.icp = {
      biz_type: answers.biz_type,
      description: answers.icp_description,
      jbtd: answers.jbtd,
      sales_cycle: answers.sales_cycle,
    };
  }

  if (sectionKey === 'posicionamento') {
    patch.positioning = {
      pod: answers.pod,
      generic_strategy: answers.generic_strategy,
      brand_salience: answers.brand_salience,
      unfair_advantage: answers.unfair_advantage,
    };
  }

  if (sectionKey === 'competicao') {
    patch.competitors = answers.direct_competitors
      ? (answers.direct_competitors as string).split(',').map((s) => s.trim())
      : [];
    patch.competitive_analysis = {
      substitutes: answers.substitutes,
      entry_barriers: answers.entry_barriers,
      buyer_power: answers.buyer_power,
    };
  }

  if (sectionKey === 'growth') {
    patch.channels = answers.active_channels ?? [];
    patch.ltv_cac = answers.ltv_cac_ratio;
    // north_star_metric is no longer asked — same reasoning as tam_sam_som.
    patch.growth_bottleneck = answers.growth_bottleneck;
    patch.budget = answers.monthly_budget;
  }

  await upsertBusinessContext(workspaceId, patch);

  const existing = await db.query.onboardingState.findFirst({
    where: eq(onboardingState.workspaceId, workspaceId),
  });

  const completedSections = {
    ...((existing?.completedSections as Record<string, boolean>) ?? {}),
    [sectionKey]: true,
  };

  await db
    .insert(onboardingState)
    .values({ workspaceId, currentSection: sectionKey, completedSections, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: onboardingState.workspaceId,
      set: { currentSection: sectionKey, completedSections, updatedAt: new Date() },
    });

  const shouldTriggerResearch =
    sectionKey === 'empresa' && Boolean(answers.website) && !existing?.brandResearchTriggered;

  if (shouldTriggerResearch) {
    await db
      .insert(onboardingState)
      .values({ workspaceId, brandResearchTriggered: true })
      .onConflictDoUpdate({
        target: onboardingState.workspaceId,
        set: { brandResearchTriggered: true },
      });

    // Fire-and-forget, in-process — see note in the git history of this file
    // (previously HTTP self-calls, which don't carry session auth).
    const website = answers.website as string;
    void (async () => {
      const [ctx, businessContext] = await Promise.all([
        buildWorkspaceContext(workspaceId),
        getBusinessContext(workspaceId),
      ]);
      await runBrandResearch(
        { workspaceId, website, businessContext: businessContext as Record<string, unknown> },
        ctx
      );
    })().catch(console.error);
  }

  const isComplete = ALL_SECTIONS.every((s) => completedSections[s]);

  if (isComplete) {
    void (async () => {
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

      // Everything below answers "what happens after the diagnostic?" — it
      // used to be nothing: the dashboard just showed the scores, modules
      // stayed locked until the user happened to send a chat message, and
      // TAM/SAM/SOM / North Star Metric were never filled in since they're
      // no longer asked. Runs in parallel; each is independently non-fatal.
      await Promise.all([
        estimateMarketSizing(workspaceId, ctx).catch((err) => {
          console.error('[submitOnboardingSection] estimateMarketSizing failed:', err);
        }),
        checkAndUnlockModules(workspaceId, scores).catch((err) => {
          console.error('[submitOnboardingSection] checkAndUnlockModules failed:', err);
        }),
        generateExecutiveSummary(workspaceId).catch((err) => {
          console.error('[submitOnboardingSection] generateExecutiveSummary failed:', err);
        }),
      ]);
    })().catch(console.error);
  }

  return { sectionKey, triggeredResearch: shouldTriggerResearch, triggeredScoring: isComplete };
}
