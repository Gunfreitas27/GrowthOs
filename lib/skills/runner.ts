import AdmZip from 'adm-zip';
import path from 'path';
import { openrouter, MODELS } from '@/lib/openrouter';

export const SKILL_NAMES = [
  'advisory-board',
  'brand-squad',
  'c-level-squad',
  'claude-code-mastery',
  'copy-squad',
  'cybersecurity',
  'data-squad',
  'design-squad',
  'hormozi-squad',
  'movement',
  'storytelling',
  'traffic-masters',
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

export interface WorkspaceContext {
  workspaceId: string;
  businessContext?: Record<string, unknown>;
  brandContext?: Record<string, unknown>;
  maturityScores?: Record<string, number>;
  // Real, externally-verified facts (CNPJ/IBGE today) — see lib/enrichment/.
  // Populated from cache only; never fetched inline on the agent's hot path.
  marketSignals?: Record<string, unknown>;
}

export interface SkillInput {
  task: string;
  context?: string;
  data?: Record<string, unknown>;
}

export interface SkillResult {
  ok: true;
  content: string;
  skill: SkillName;
  model: string;
}

export interface SkillError {
  ok: false;
  reason: string;
  skill: SkillName;
}

const skillCache = new Map<SkillName, string>();

// Next.js always runs with cwd = repo root, so process.cwd() works there.
// A standalone process (e.g. mcp-server/) may be spawned with a different
// cwd, so it can override the lookup root explicitly via SKILLS_ROOT_DIR.
function skillsRoot(): string {
  return process.env.SKILLS_ROOT_DIR
    ? path.resolve(process.env.SKILLS_ROOT_DIR)
    : process.cwd();
}

function loadSkillMd(skillName: SkillName): string {
  if (skillCache.has(skillName)) return skillCache.get(skillName)!;

  const skillPath = path.join(skillsRoot(), `${skillName}.skill`);
  const zip = new AdmZip(skillPath);
  const skillMd = zip.readAsText('SKILL.md');

  if (!skillMd) throw new Error(`SKILL.md not found in ${skillName}.skill`);

  skillCache.set(skillName, skillMd);
  return skillMd;
}

function buildSkillPrompt(input: SkillInput, ctx: WorkspaceContext): string {
  const parts: string[] = [input.task];

  if (ctx.businessContext && Object.keys(ctx.businessContext).length > 0) {
    parts.push(
      `\n## Business Context\n${JSON.stringify(ctx.businessContext, null, 2)}`
    );
  }

  if (ctx.brandContext && Object.keys(ctx.brandContext).length > 0) {
    parts.push(
      `\n## Brand Context\n${JSON.stringify(ctx.brandContext, null, 2)}`
    );
  }

  if (ctx.maturityScores && Object.keys(ctx.maturityScores).length > 0) {
    parts.push(
      `\n## Growth Maturity Scores\n${JSON.stringify(ctx.maturityScores, null, 2)}`
    );
  }

  if (ctx.marketSignals && Object.keys(ctx.marketSignals).length > 0) {
    parts.push(
      `\n## Dados Reais de Mercado (verificados, não estimados — trate como fato, não como sugestão a ser confirmada)\n${JSON.stringify(ctx.marketSignals, null, 2)}`
    );
  }

  if (input.context) {
    parts.push(`\n## Additional Context\n${input.context}`);
  }

  if (input.data) {
    parts.push(`\n## Data\n${JSON.stringify(input.data, null, 2)}`);
  }

  return parts.join('\n');
}

export async function invokeSkill(
  skillName: SkillName,
  input: SkillInput,
  ctx: WorkspaceContext,
  model: string = MODELS.default
): Promise<SkillResult | SkillError> {
  try {
    const skillMd = loadSkillMd(skillName);
    const prompt = buildSkillPrompt(input, ctx);

    const response = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: skillMd },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from model');

    return { ok: true, content, skill: skillName, model };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[SkillRunner] ${skillName} failed:`, reason);
    return { ok: false, reason, skill: skillName };
  }
}

export async function invokeSkillStream(
  skillName: SkillName,
  input: SkillInput,
  ctx: WorkspaceContext,
  model: string = MODELS.default
) {
  const skillMd = loadSkillMd(skillName);
  const prompt = buildSkillPrompt(input, ctx);

  return openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: skillMd },
      { role: 'user', content: prompt },
    ],
    stream: true,
    max_tokens: 4096,
  });
}
