import Anthropic from '@anthropic-ai/sdk'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { prisma } from '@/lib/prisma'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Sub-agent tool definitions ────────────────────────────────────────────────

export const subAgentTools: Tool[] = [
  {
    name: 'market_intelligence',
    description:
      'Analyzes competitive landscape, market sizing (TAM/SAM/SOM), industry trends, and positioning opportunities. Use for questions about market, competitors, industry dynamics, or positioning.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The market research question or focus area' },
        industry: { type: 'string', description: 'Industry vertical or sector' },
        stage: {
          type: 'string',
          enum: ['pre_pmf', 'post_pmf', 'scaling', 'enterprise'],
          description: 'Company stage',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'icp_builder',
    description:
      'Builds detailed Ideal Customer Profiles with psychographics, jobs-to-be-done, buying triggers, and success patterns. Use for persona creation, customer segmentation, or ICP refinement.',
    input_schema: {
      type: 'object',
      properties: {
        product_description: { type: 'string', description: 'What the product does' },
        market_type: { type: 'string', enum: ['b2b', 'b2c', 'b2b2c', 'marketplace'] },
        known_customers: {
          type: 'string',
          description: 'Description of existing best customers if any',
        },
      },
      required: ['product_description'],
    },
  },
  {
    name: 'channel_strategist',
    description:
      'Recommends channel selection, budget allocation, CAC benchmarks, and channel-market fit analysis. Use for questions about marketing channels, paid vs organic, budget allocation.',
    input_schema: {
      type: 'object',
      properties: {
        budget_range: { type: 'string', description: 'Monthly marketing budget range' },
        target_cac: { type: 'string', description: 'Target Customer Acquisition Cost' },
        stage: { type: 'string', description: 'Company/growth stage' },
        vertical: { type: 'string', description: 'Industry vertical' },
        current_channels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Currently active channels',
        },
      },
      required: ['stage'],
    },
  },
  {
    name: 'growth_loops',
    description:
      'Designs viral loops, product-led growth motions, and referral mechanics. Calculates loop coefficients and designs compounding growth systems. Use for viral growth, PLG, or referral strategy.',
    input_schema: {
      type: 'object',
      properties: {
        product_type: { type: 'string', description: 'Type of product (SaaS, marketplace, app, etc.)' },
        current_referral_rate: {
          type: 'number',
          description: 'Current referral rate if known (0-1)',
        },
        viral_mechanic: {
          type: 'string',
          description: 'Any existing viral mechanic in the product',
        },
      },
      required: ['product_type'],
    },
  },
  {
    name: 'experiment_generator',
    description:
      'Generates growth experiment hypotheses with ICE/RICE scoring. Designs test plans, defines success metrics, and suggests experiment prioritization. Use when the user wants experiment ideas, test design, or experiment prioritization.',
    input_schema: {
      type: 'object',
      properties: {
        growth_problem: {
          type: 'string',
          description: 'The specific growth problem or opportunity to address',
        },
        funnel_stage: {
          type: 'string',
          enum: ['awareness', 'acquisition', 'activation', 'retention', 'revenue', 'referral'],
        },
        constraint: { type: 'string', description: 'Time, budget, or resource constraints' },
        count: {
          type: 'number',
          description: 'How many experiment ideas to generate (default 5)',
        },
      },
      required: ['growth_problem', 'funnel_stage'],
    },
  },
  {
    name: 'funnel_diagnostician',
    description:
      'Performs deep funnel analysis beyond simple benchmarks. Identifies root causes of drop-offs, segments by cohort/channel/device, and generates prioritized fix recommendations. Use for funnel analysis, conversion rate optimization, or drop-off investigation.',
    input_schema: {
      type: 'object',
      properties: {
        funnel_data: {
          type: 'string',
          description: 'Funnel stage names and conversion rates or values',
        },
        focus_stage: {
          type: 'string',
          description: 'Specific stage to focus the diagnosis on',
        },
        vertical: { type: 'string', description: 'Industry vertical for benchmark comparison' },
      },
      required: ['funnel_data'],
    },
  },
  {
    name: 'forecast_modeler',
    description:
      'Creates growth forecasts with scenario modeling and qualitative reasoning. Projects metrics based on uplift assumptions and explains the "why" behind numbers. Use for forecasting, projection modeling, or scenario planning.',
    input_schema: {
      type: 'object',
      properties: {
        baseline_metrics: {
          type: 'string',
          description: 'Current baseline metrics (MRR, users, conversion rates)',
        },
        uplift_assumptions: {
          type: 'string',
          description: 'What improvements are being modeled (e.g., 20% activation lift)',
        },
        horizon: { type: 'string', description: 'Forecast horizon (e.g., 6 months, 12 months)' },
      },
      required: ['baseline_metrics'],
    },
  },
  {
    name: 'retention_specialist',
    description:
      'Analyzes churn drivers, designs activation sequences, and builds habit loops. Uses cohort thinking and behavioral economics. Use for retention strategy, churn reduction, activation optimization, or engagement mechanics.',
    input_schema: {
      type: 'object',
      properties: {
        product_category: { type: 'string', description: 'Product category/type' },
        current_retention: {
          type: 'string',
          description: 'Current retention metrics (D7, D30, monthly churn, etc.)',
        },
        top_churn_reasons: {
          type: 'string',
          description: 'Known reasons users churn if available',
        },
      },
      required: ['product_category'],
    },
  },
  {
    name: 'content_strategist',
    description:
      'Designs content strategy, SEO playbooks, content calendars, and distribution plans. Maps content to conversion. Use for content marketing, SEO strategy, blog strategy, or thought leadership.',
    input_schema: {
      type: 'object',
      properties: {
        industry: { type: 'string', description: 'Industry and target audience' },
        goal: {
          type: 'string',
          enum: ['seo', 'brand_awareness', 'demand_gen', 'retention', 'all'],
        },
        existing_content: {
          type: 'string',
          description: 'What content types already exist',
        },
      },
      required: ['industry', 'goal'],
    },
  },
  {
    name: 'pricing_optimizer',
    description:
      'Designs pricing strategy, packaging, and monetization models. Identifies value metrics, analyzes pricing-to-willingness-to-pay alignment. Use for pricing strategy, packaging decisions, monetization design, or value metric identification.',
    input_schema: {
      type: 'object',
      properties: {
        product_type: { type: 'string', description: 'Product type and business model' },
        current_arpu: { type: 'string', description: 'Current ARPU if known' },
        segments: { type: 'string', description: 'Key customer segments and their willingness to pay' },
      },
      required: ['product_type'],
    },
  },
]

// ─── Live Velox data tools ─────────────────────────────────────────────────────

export const veloxDataTools: Tool[] = [
  {
    name: 'get_funnel_data',
    description:
      "Fetches the organization's latest funnel data with conversion rates. Use when user asks about their specific funnel numbers or wants a detailed funnel breakdown.",
    input_schema: {
      type: 'object',
      properties: {
        date_range_days: { type: 'number', description: 'Number of days to look back (default 30)' },
      },
    },
  },
  {
    name: 'get_experiments',
    description:
      "Retrieves the organization's experiments from the backlog. Use when generating experiment ideas to avoid duplication or when user asks about their experiments.",
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'in_progress', 'backlog', 'completed', 'idea'],
        },
      },
    },
  },
  {
    name: 'get_learnings',
    description:
      "Retrieves the organization's learnings repository. Use when user asks what's been tried before or when building on past insights.",
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by category' },
        result_type: {
          type: 'string',
          enum: ['validated', 'invalidated', 'inconclusive', 'all'],
        },
      },
    },
  },
  {
    name: 'create_experiment',
    description:
      'Creates a new experiment in the Velox backlog. ONLY use this when the user explicitly asks to save or create an experiment.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Experiment title' },
        hypothesis: { type: 'string', description: 'If/Then/Because hypothesis' },
        funnel_stage: {
          type: 'string',
          enum: ['awareness', 'acquisition', 'activation', 'retention', 'revenue', 'referral'],
        },
        ice_impact: { type: 'number', description: 'ICE Impact score 1-10' },
        ice_confidence: { type: 'number', description: 'ICE Confidence score 1-10' },
        ice_ease: { type: 'number', description: 'ICE Ease score 1-10' },
      },
      required: ['title', 'hypothesis', 'funnel_stage'],
    },
  },
]

export const allTools: Tool[] = [...veloxDataTools, ...subAgentTools]

// ─── Sub-agent system prompts ──────────────────────────────────────────────────

const subAgentPrompts: Record<string, string> = {
  market_intelligence: `You are a world-class market intelligence analyst. Your job is to deliver sharp, specific competitive and market analysis.

Structure your response with:
## Market Overview
(TAM/SAM/SOM estimation with reasoning)

## Competitive Landscape
(Top 3-5 competitors with positioning map — who they target, their moat, their weakness)

## Key Trends
(2-3 trends shaping this market in the next 12-24 months)

## Positioning Opportunity
(Specific white space or differentiation angle)

Be specific with numbers and frameworks. No vague statements.`,

  icp_builder: `You are an expert in customer research and ideal customer profile design using Jobs-to-be-Done and behavioral segmentation.

Structure your response with:
## Primary ICP Profile
(Firmographics/demographics, psychographics, role/title)

## Jobs-to-be-Done
(Functional, emotional, and social jobs — what are they hiring this product to do?)

## Buying Triggers
(What event or condition causes them to seek a solution?)

## Success Looks Like
(How do they measure that the product is working?)

## Red Flags (Who NOT to target)
(Anti-ICP signals)

Be specific. Give examples. Name real job titles, real company types.`,

  channel_strategist: `You are a growth channel strategist with deep expertise in CAC optimization and channel-market fit.

Structure your response with:
## Channel-Market Fit Analysis
(Which channels align best with this stage, budget, and vertical)

## Recommended Channel Mix
(Primary / Secondary / Experimental with budget allocation %)

## CAC Benchmarks
(Expected CAC ranges per channel for this vertical)

## Quick Wins (0-30 days)
(What to activate immediately)

## 90-Day Channel Roadmap
(What to build and test)

Include real channel names, real CAC benchmarks, real playbooks.`,

  growth_loops: `You are an expert in designing compounding growth systems — viral loops, PLG motions, and referral mechanics.

Structure your response with:
## Loop Audit
(What loops might already exist in the product)

## Recommended Primary Loop
(Input → Action → Output → Reinvestment — with specific mechanics)

## Viral Coefficient Analysis
(How to calculate K factor, current estimate, and what it needs to be)

## Implementation Roadmap
(Specific product/marketing changes to activate the loop)

## Metrics to Track
(How to measure if the loop is compounding)

Be specific about product mechanics. Name the exact features and flows.`,

  experiment_generator: `You are a growth experimentation expert with deep knowledge of ICE/RICE prioritization and test design.

For each experiment, provide:
### Experiment N: [Title]
**Hypothesis**: If we [specific change], then [expected outcome], because [mechanism/reasoning]
**ICE Score**: Impact [X/10] × Confidence [X/10] × Ease [X/10] = **[score]**
**Primary Metric**: [What to measure]
**Secondary Metric**: [What to watch]
**Min Sample Size**: [Number for statistical significance]
**Test Duration**: [Days recommended]
**Implementation**: [Brief how-to]

Generate exactly as many experiments as requested. Make them specific, not generic.`,

  funnel_diagnostician: `You are an expert funnel analyst specializing in conversion rate optimization and user behavior analysis.

Structure your response with:
## Funnel Health Assessment
(Overall conversion health with severity rating)

## Stage-by-Stage Analysis
(For each stage: actual rate, benchmark range, gap, severity)

## Root Cause Hypothesis (Top 3)
(Most likely causes for the biggest drop-off, ranked by confidence)

## Prioritized Recommendations
(Specific fixes ranked by impact/effort, with expected lift %)

## Measurement Plan
(What to track to confirm diagnosis and measure improvement)

Be clinical and specific. Use conversion rate benchmarks for the vertical.`,

  forecast_modeler: `You are a growth modeling expert who builds scenario forecasts with clear assumptions and reasoning.

Structure your response with:
## Baseline Analysis
(Current trajectory if nothing changes)

## Scenario Modeling
For each scenario (Conservative / Base / Aggressive):
- Key assumptions
- Month-by-month projection (table format)
- Key milestones

## Sensitivity Analysis
(Which variables matter most — top 3 levers)

## What Has to Be True
(For the base case to hit, what must happen?)

Show your math. Use tables. Be specific about compound effects.`,

  retention_specialist: `You are a retention and engagement expert specializing in activation design and churn prevention.

Structure your response with:
## Retention Diagnosis
(Current retention profile and what it signals)

## Activation Sequence Design
(Step-by-step journey from signup to AHA moment)

## Habit Loop Design
(Trigger → Action → Variable Reward → Investment cycle for this product)

## Churn Prevention Playbook
(Early warning signals + intervention plays)

## 30/60/90 Day Retention Targets
(What good looks like as you improve)

Use behavioral science frameworks. Be specific about product mechanics.`,

  content_strategist: `You are a content and SEO strategist with expertise in demand generation and content-led growth.

Structure your response with:
## Content-Market Fit Analysis
(What content types work for this audience and vertical)

## SEO Opportunity Map
(High-value keyword clusters with search intent mapping)

## Content Pillar Framework
(3-4 pillars with sub-topics and content types)

## Distribution Playbook
(Where to publish, how to amplify, how to repurpose)

## 90-Day Content Calendar
(High-level plan with priorities)

Be specific about topics, keywords, and formats. No generic advice.`,

  pricing_optimizer: `You are a pricing strategy expert specializing in SaaS and digital product monetization.

Structure your response with:
## Value Metric Analysis
(What customers actually pay for — the right unit of pricing)

## Pricing Model Comparison
(Compare 3 models: per-seat, usage-based, outcome-based — pros/cons for this product)

## Recommended Pricing Architecture
(Tiers, price points, feature packaging)

## Packaging Strategy
(What goes in each tier and why)

## Price Testing Roadmap
(How to test pricing without alienating customers)

Include real SaaS pricing benchmarks. Be specific about price points.`,
}

// ─── Tool execution ────────────────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  organizationId: string,
  userId: string
): Promise<string> {
  // Velox data tools — read live DB
  if (toolName === 'get_funnel_data') {
    return await getFunnelData(organizationId, toolInput)
  }
  if (toolName === 'get_experiments') {
    return await getExperiments(organizationId, toolInput)
  }
  if (toolName === 'get_learnings') {
    return await getLearnings(organizationId, toolInput)
  }
  if (toolName === 'create_experiment') {
    return await createExperiment(organizationId, userId, toolInput)
  }

  // Sub-agent tools — call Claude Haiku with specialized prompt
  const systemPrompt = subAgentPrompts[toolName]
  if (!systemPrompt) {
    return `Unknown tool: ${toolName}`
  }

  const userMessage = Object.entries(toolInput)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
    .join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : 'No response from sub-agent.'
  } catch (error) {
    console.error(`Sub-agent ${toolName} error:`, error)
    return `Error running ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// ─── Velox data tool implementations ─────────────────────────────────────────

async function getFunnelData(
  organizationId: string,
  input: Record<string, unknown>
): Promise<string> {
  const days = typeof input.date_range_days === 'number' ? input.date_range_days : 30
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const funnels = await prisma.funnel.findMany({
    where: { organizationId },
    include: {
      snapshots: {
        where: { snapshotDate: { gte: cutoff } },
        orderBy: { snapshotDate: 'desc' },
        take: 3,
      },
    },
    take: 5,
  })

  if (!funnels.length) return 'No funnels found.'

  return funnels
    .map((f) => {
      const snap = f.snapshots[0]
      let stages = 'No recent snapshots'
      if (snap?.stageData) {
        try {
          const s = JSON.parse(snap.stageData)
          stages = s.map((st: any) => `${st.stageName}: ${st.value}`).join(' → ')
        } catch {
          stages = 'Parse error'
        }
      }
      return `Funnel "${f.name}" (${f.description ?? ''}): ${stages}`
    })
    .join('\n')
}

async function getExperiments(
  organizationId: string,
  input: Record<string, unknown>
): Promise<string> {
  const status = typeof input.status === 'string' ? input.status : 'all'
  const where: any = { organizationId }
  if (status !== 'all') where.status = status

  const experiments = await prisma.experiment.findMany({
    where,
    orderBy: { priorityScore: 'desc' },
    take: 15,
  })

  if (!experiments.length) return 'No experiments found.'

  return experiments
    .map((e) => {
      const score = e.priorityScore ? ` [score: ${e.priorityScore.toFixed(1)}]` : ''
      const hypothesis = e.hypothesis ? `\n  Hypothesis: ${e.hypothesis}` : ''
      return `- "${e.title}" [${e.status}] [${e.funnelStage}]${score}${hypothesis}`
    })
    .join('\n')
}

async function getLearnings(
  organizationId: string,
  input: Record<string, unknown>
): Promise<string> {
  const where: any = { organizationId }
  if (input.category && input.category !== 'all') where.category = input.category
  if (input.result_type && input.result_type !== 'all') where.resultType = input.result_type

  const learnings = await prisma.learning.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (!learnings.length) return 'No learnings found.'

  return learnings
    .map((l) => `[${l.resultType.toUpperCase()}] [${l.impactLevel}] ${l.title}: ${l.summary}`)
    .join('\n')
}

async function createExperiment(
  organizationId: string,
  userId: string,
  input: Record<string, unknown>
): Promise<string> {
  const title = typeof input.title === 'string' ? input.title : ''
  const hypothesis = typeof input.hypothesis === 'string' ? input.hypothesis : ''
  const funnelStage = typeof input.funnel_stage === 'string' ? input.funnel_stage : 'acquisition'

  if (!title || !hypothesis) return 'Error: title and hypothesis are required.'

  const iceImpact = typeof input.ice_impact === 'number' ? input.ice_impact : undefined
  const iceConfidence = typeof input.ice_confidence === 'number' ? input.ice_confidence : undefined
  const iceEase = typeof input.ice_ease === 'number' ? input.ice_ease : undefined

  let priorityScore: number | undefined
  if (iceImpact && iceConfidence && iceEase) {
    priorityScore = (iceImpact + iceConfidence + iceEase) / 3
  }

  const experiment = await prisma.experiment.create({
    data: {
      title,
      hypothesis,
      funnelStage,
      status: 'backlog',
      organizationId,
      ownerId: userId,
      iceImpact,
      iceConfidence,
      iceEase,
      priorityScore,
    },
  })

  return `✓ Experiment created: "${experiment.title}" [ID: ${experiment.id}] with ICE score ${priorityScore?.toFixed(1) ?? 'N/A'}. Saved to your backlog.`
}
