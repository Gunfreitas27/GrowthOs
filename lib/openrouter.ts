import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function getOpenRouter(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY ?? 'placeholder',
      defaultHeaders: {
        'HTTP-Referer': 'https://growthOS.app',
        'X-Title': 'Flywell Growth Orchestrator',
      },
    });
  }
  return _client;
}

// Convenience alias — still lazy
export const openrouter = {
  get chat() { return getOpenRouter().chat; },
};

// Free-tier models (OpenRouter ":free" pool) — the project has no budget yet
// ("precisamos ganhar dinheiro antes de investir"). Verified live against
// the real OpenRouter API on 2026-09-16, not from training-data knowledge —
// the free-tier lineup changes constantly and none of these existed as far
// as prior knowledge goes. Re-check https://openrouter.ai/api/v1/models
// (filter pricing.prompt === "0") before assuming a ":free" id below still
// exists; OpenRouter deprecates free models without much notice.
//
// Every invokeSkill() call injects the FULL *.skill SKILL.md as the system
// message — up to ~340KB text (~100k tokens) for advisory-board.skill alone
// — so every tier here needs a large context window, not just "advanced".
export const MODELS = {
  // Default for most agents. Routed via OpenRouter's free-pool auto-router
  // (picks among many free models, retrying on upstream rate limits) rather
  // than a single pinned model — pinning to e.g. google/gemma-4-31b-it:free
  // hit a 429 (shared free-tier pool) within the first test call.
  default: 'openrouter/free',
  // Deep analysis: brand-squad CBBE, advisory-board board meeting, maturity
  // scoring. Originally pinned to nvidia/nemotron-3-ultra-550b-a55b:free
  // (1M context, 550B/55B-active MoE) for raw capability — a tiny isolated
  // call was fast and clean, but against the REAL prompt size (full skill +
  // business/brand/market context, tens of thousands of tokens) it took
  // several minutes and one run never returned inside a 60s client timeout.
  // Routed like `default` instead: a free-tier product can't assume any
  // single free model has dedicated capacity, so resilience (auto-retry
  // across the pool) matters more here than picking the single biggest model.
  advanced: 'openrouter/free',
  // Unused today (no call site passes a model override) — kept pointed at
  // verified-working free models rather than left stale.
  fast: 'openrouter/free',
  openSource: 'openrouter/free',
} as const;

export type ModelKey = keyof typeof MODELS;
