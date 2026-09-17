import { WorkspaceContext } from '@/lib/skills/runner';

export type { WorkspaceContext };

// Module keys — must match module_states.module_key values
export const MODULE_KEYS = [
  'strategy',
  'branding',
  'paid',
  'seo',
  'crm',
  'analytics',
  'outbound',
  'community',
  'project',
  'integrations',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// Maturity dimensions — must match maturity_scores.dimension values
export const MATURITY_DIMENSIONS = [
  'awareness_posicionamento',
  'aquisicao_paga',
  'organico_conteudo',
  'crm_lifecycle',
  'analytics_atribuicao',
  'diferenciacao_competitiva',
  'comunidade_movimento', // unlockable — 7th dimension
] as const;

export type MaturityDimension = (typeof MATURITY_DIMENSIONS)[number];

// Chat message content shapes
export interface TextContent {
  type: 'text';
  text: string;
}

export interface InsightContent {
  type: 'insight';
  title: string;
  body: string;
  dimension?: MaturityDimension;
  score?: number;
}

export interface ModuleUnlockContent {
  type: 'module_unlock';
  moduleKey: ModuleKey;
  reason: string;
  message: string;
}

export interface ActionRequestContent {
  type: 'action_request';
  actionId: string;
  agentName: string;
  title: string;
  description: string;
  platform: string;
  payload: Record<string, unknown>;
}

export interface ResearchProgressContent {
  type: 'research_progress';
  lens: string;
  status: 'running' | 'done' | 'error';
  summary?: string;
}

export type MessageContent =
  | TextContent
  | InsightContent
  | ModuleUnlockContent
  | ActionRequestContent
  | ResearchProgressContent;

// SSE event streaming format
export interface SSEChunk {
  type: 'delta' | 'done' | 'error' | 'module_unlock' | 'insight';
  data: string | MessageContent;
}
