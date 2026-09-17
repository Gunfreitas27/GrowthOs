import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  pgEnum,
  real,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────
export const moduleStatusEnum = pgEnum('module_status', [
  'hidden',
  'revealed',
  'setup',
  'active',
]);

export const messageRoleEnum = pgEnum('message_role', [
  'user',
  'assistant',
  'system',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'action_request',
  'approval_pending',
  'insight',
  'module_unlock',
  'research_progress',
]);

export const planEnum = pgEnum('plan', ['free', 'starter', 'growth', 'scale']);

export const mcpStatusEnum = pgEnum('mcp_status', [
  'connected',
  'disconnected',
  'error',
]);

// ── Workspaces ─────────────────────────────────────────────────────────────
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Users ──────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  role: text('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Business Context (BCG) ─────────────────────────────────────────────────
export const businessContext = pgTable('business_context', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  // JSONB: { segment, stage, website, tam_sam_som, icp, jbtd, channels,
  //          ltv_cac, north_star_metric, budget, competitors, objectives }
  data: jsonb('data').notNull().default('{}'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Brand Context ──────────────────────────────────────────────────────────
export const brandContext = pgTable('brand_context', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  // JSONB: { brief, voice, archetype, colors, typography, tagline,
  //          manifesto, brandbook_url, research_results }
  data: jsonb('data').notNull().default('{}'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Chat Messages ──────────────────────────────────────────────────────────
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    role: messageRoleEnum('role').notNull(),
    // JSONB content allows rich payloads: { text, action, approval_id, module_key }
    content: jsonb('content').notNull(),
    messageType: messageTypeEnum('message_type').default('text').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('chat_messages_workspace_idx').on(t.workspaceId)]
);

// ── Module States ──────────────────────────────────────────────────────────
export const moduleStates = pgTable(
  'module_states',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    moduleKey: text('module_key').notNull(),
    status: moduleStatusEnum('status').default('hidden').notNull(),
    revealedAt: timestamp('revealed_at'),
  },
  (t) => [
    uniqueIndex('module_states_workspace_module_idx').on(
      t.workspaceId,
      t.moduleKey
    ),
  ]
);

// ── Maturity Scores ────────────────────────────────────────────────────────
export const maturityScores = pgTable(
  'maturity_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    dimension: text('dimension').notNull(),
    score: real('score').notNull().default(0),
    // The LLM already generates a one-sentence rationale for every score
    // (see lib/maturity/scorer.ts) — it was being computed and discarded,
    // leaving the dashboard showing a bare number with no reasoning behind
    // it. Nullable: rows written before this column existed have none.
    rationale: text('rationale'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('maturity_scores_workspace_dimension_idx').on(
      t.workspaceId,
      t.dimension
    ),
  ]
);

// ── MCP Connections ────────────────────────────────────────────────────────
export const mcpConnections = pgTable(
  'mcp_connections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    // AES-GCM encrypted: iv:ciphertext hex
    accessTokenEnc: text('access_token_enc'),
    status: mcpStatusEnum('status').default('disconnected').notNull(),
    lastSync: timestamp('last_sync'),
  },
  (t) => [
    uniqueIndex('mcp_connections_workspace_platform_idx').on(
      t.workspaceId,
      t.platform
    ),
  ]
);

// ── Platform Cache ─────────────────────────────────────────────────────────
export const platformCache = pgTable(
  'platform_cache',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    cacheKey: text('cache_key').notNull(),
    data: jsonb('data').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (t) => [
    uniqueIndex('platform_cache_workspace_key_idx').on(
      t.workspaceId,
      t.platform,
      t.cacheKey
    ),
  ]
);

// ── Agent Actions (Audit Trail) ────────────────────────────────────────────
export const agentActions = pgTable(
  'agent_actions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    agentName: text('agent_name').notNull(),
    actionType: text('action_type').notNull(),
    payload: jsonb('payload'),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at'),
    status: text('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('agent_actions_workspace_idx').on(t.workspaceId)]
);

// ── Workspace API Keys ─────────────────────────────────────────────────────
// Resolves a caller to a workspace from the KEY itself (server-side lookup),
// never from a client-supplied workspaceId — see lib/auth/api-keys.ts.
export const workspaceApiKeys = pgTable(
  'workspace_api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // First chars of the plaintext key, shown in UIs/logs for identification.
    // The full secret is never stored — only its sha256 hash (keyHash).
    keyPrefix: text('key_prefix').notNull(),
    keyHash: text('key_hash').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    revokedAt: timestamp('revoked_at'),
  },
  (t) => [index('workspace_api_keys_workspace_idx').on(t.workspaceId)]
);

// ── Onboarding State ───────────────────────────────────────────────────────
export const onboardingState = pgTable('onboarding_state', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  currentSection: text('current_section').default('empresa').notNull(),
  // JSONB: { empresa: bool, cliente: bool, posicionamento: bool, competicao: bool, growth: bool }
  completedSections: jsonb('completed_sections').notNull().default('{}'),
  brandResearchTriggered: boolean('brand_research_triggered').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Auth.js required tables (next-auth v5) ─────────────────────────────────
export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: timestamp('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (t) => [
    uniqueIndex('accounts_provider_account_idx').on(
      t.provider,
      t.providerAccountId
    ),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (t) => [
    uniqueIndex('verification_tokens_identifier_token_idx').on(
      t.identifier,
      t.token
    ),
  ]
);
