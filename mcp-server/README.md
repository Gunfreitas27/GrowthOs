# GrowthOS MCP Server (proof of concept)

Exposes the GrowthOS business-logic layer (`lib/`) as MCP tools, so any MCP
client (Claude Desktop, Claude Code, other agents) can call directly into the
product's diagnostic/advisory logic instead of going through the Next.js UI.

This is a **proof of concept** for the "service, not platform" question: can
an external agent get real value out of GrowthOS's core logic without the
product's own frontend in the loop?

## What it exposes

8 tools, each a thin wrapper around an existing `lib/` function (see
`src/tools.ts` for exact mappings). None of them take a `workspaceId`
argument — see "Authentication" below for why.

| Tool | Wraps | Side effects |
|---|---|---|
| `get_workspace_context` | `buildWorkspaceContext` | none (read) |
| `get_maturity_scores` | `getMaturityScores` | none (read) |
| `run_maturity_scoring` | `runMaturityScoring` | writes `maturity_scores`, calls OpenRouter (2 calls) |
| `ask_advisory_board` | new `askAdvisoryBoard` helper | none — does not touch `chat_messages` or module unlocks, calls OpenRouter (1 call) |
| `enrich_company_context` | new `enrichWorkspaceMarketSignals` (`lib/enrichment/`) | writes `platform_cache`, calls BrasilAPI + IBGE (free, no auth) — no LLM call |
| `check_domain_seo_signals` | new `getDomainSeoSignals` (`lib/enrichment/domain-seo.ts`) | writes `platform_cache`, calls PageSpeed Insights + OpenPageRank + Wayback Machine — free Ahrefs replacement, no LLM call |
| `list_available_skills` | `SKILL_NAMES` constant | none (read) |
| `submit_onboarding_answers` | new `submitOnboardingSection` (`lib/onboarding/submit.ts`) | writes `business_context`/`onboarding_state`, may trigger brand research and/or maturity scoring in the background |
| `run_brand_research` | `runBrandResearch` | writes `brand_context.research_results`, calls OpenRouter (4 sequential calls, slow: ~30-60s) |

It always talks to the real Postgres/OpenRouter — it does not go through
`lib/mock/resolver.ts`, regardless of `USE_MOCK_DATA` in `.env.local`.

## Two transports, same tools

- **stdio** (`src/stdio.ts`) — for local/trusted MCP clients (Claude Desktop,
  Claude Code). One `GROWTHOS_API_KEY` env var per process, one workspace per
  process. See "Running it" below.
- **HTTP** (`app/api/mcp/route.ts`, mounted in the Next.js app) — the hosted
  counterpart, deployed alongside the product on Vercel. Same `registerTools`
  call, same tools, stateless (one `McpServer` + transport per request, no
  session — matches how serverless functions actually run). Auth is the same
  API key, sent as `Authorization: Bearer <key>` instead of an env var:

  ```bash
  curl -s https://your-deployment.vercel.app/api/mcp \
    -H "Authorization: Bearer gos_live_..." \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
  ```

  Rate-limited at 60 requests/minute per workspace via `lib/rate-limit.ts`
  (`@upstash/redis` — fails **open**, not closed, if Redis is unreachable or
  `UPSTASH_REDIS_REST_URL`/`TOKEN` are still the placeholder values from
  `.env.local.example`: rate limiting is defense-in-depth, the API key is the
  real auth boundary, so a Redis outage shouldn't take the endpoint down).
  Set real Upstash credentials to make the limit actually enforce.

## Authentication

**One server process is authenticated to exactly one workspace, via one API
key.** There is no `workspaceId` tool argument anywhere — the workspace is
resolved server-side, once, at startup, from `GROWTHOS_API_KEY`
(`lib/auth/api-keys.ts#resolveWorkspaceFromApiKey`), and every tool call in
that process is scoped to it.

This closes the gap the earlier POC shipped with: when `workspaceId` was a
plain tool argument, any caller who could invoke the tools could pass *any*
workspace's UUID and read/write its data — there was no credential that
scoped a caller to one tenant. Now there is: `workspace_api_keys` stores only
a sha256 hash of each key (never the plaintext), the same model Stripe/GitHub
use for API keys.

### Create a key

```bash
# 1. Get (or create) a real workspace uuid
npm run seed:demo-workspace

# 2. Mint a key for it — the plaintext is shown ONCE, store it now
npm run create-api-key -- <workspaceId> "Claude Desktop"
```

Revoking a key (e.g. if it leaks) is a `UPDATE workspace_api_keys SET
revoked_at = now() WHERE key_prefix = '...'` — there's no CLI for this yet,
it wasn't needed for the POC.

## Running it

Requires **real** credentials (not the mock-mode placeholders that ship in
`.env.local` by default): `DATABASE_URL` pointing at a real Neon Postgres,
a real `OPENROUTER_API_KEY`, and a `GROWTHOS_API_KEY` from the step above.

```bash
GROWTHOS_API_KEY=gos_live_... npm run mcp:dev
```

This runs `mcp-server/src/stdio.ts` via `tsx`, loading `.env.local` with
Node's native `--env-file` (put `GROWTHOS_API_KEY` there too, or pass it
inline). The process talks MCP over stdio — it's meant to be spawned by an
MCP client, not hit directly.

### Register with an MCP client

**Claude Code CLI:**

```bash
claude mcp add growthos \
  --env DATABASE_URL="<your neon connection string>" \
  --env OPENROUTER_API_KEY="<your openrouter key>" \
  --env GROWTHOS_API_KEY="<key from create-api-key>" \
  --env SKILLS_ROOT_DIR="C:\Users\gunfr\OneDrive\Documentos\GitHub\GrowthOS" \
  -- npx tsx mcp-server/src/stdio.ts
```

**Claude Desktop** (`%APPDATA%\Claude\claude_desktop_config.json` on
Windows): add under `mcpServers`:

```json
{
  "mcpServers": {
    "growthos": {
      "command": "npx",
      "args": ["tsx", "mcp-server/src/stdio.ts"],
      "cwd": "C:\\Users\\gunfr\\OneDrive\\Documentos\\GitHub\\GrowthOS",
      "env": {
        "DATABASE_URL": "<your neon connection string>",
        "OPENROUTER_API_KEY": "<your openrouter key>",
        "GROWTHOS_API_KEY": "<key from create-api-key>",
        "SKILLS_ROOT_DIR": "C:\\Users\\gunfr\\OneDrive\\Documentos\\GitHub\\GrowthOS"
      }
    }
  }
}
```

A second customer/workspace = a second `mcpServers` entry with a different
`GROWTHOS_API_KEY` — the server code doesn't change, only which key resolves
to which workspace.

`SKILLS_ROOT_DIR` matters here specifically: GUI-launched apps like Claude
Desktop don't reliably inherit your shell's working directory, and
`lib/skills/runner.ts` needs to find the `*.skill` files at the repo root.
Always set it explicitly — don't rely on inheritance.

## Verifying it end-to-end

1. `npm run seed:demo-workspace` → copy the printed UUID.
2. `npm run create-api-key -- <uuid> "test"` → copy the printed key.
3. Start the server with that key (or register it with your MCP client) and
   confirm it logs `listening on stdio — workspace <uuid>` on stderr — proof
   the key resolved to the right tenant, not a hardcoded/guessed one.
4. Ask it to call `get_maturity_scores`. Expect `{}` (empty but valid — proves
   the DB round-trip; no `workspaceId` to pass, it's implicit now).
5. Ask it to call `run_maturity_scoring`. Expect scores 0-5 per dimension.
6. Ask it to call `get_maturity_scores` again — the scores from step 5 should
   come back. **This write-then-read is the strongest proof this isn't
   mocked**: it requires a real write and a real read against Neon.
7. Ask it to call `ask_advisory_board` with a real strategy question. The
   answer should reference the seeded business context, not be generic
   boilerplate.
8. Ask it to call `enrich_company_context` with a real CNPJ (e.g.
   `19.131.243/0001-97`, Open Knowledge Brasil — a public nonprofit, safe to
   use as a test fixture). Expect real CNAE, porte, município and IBGE
   population/GDP figures back — this hits BrasilAPI and IBGE live, no mock.
9. Call `get_workspace_context` again — `marketSignals` should now be
   populated from `platform_cache` (no external call this time, just a DB
   read). Ask `ask_advisory_board` the same question again: the answer should
   now reference the real CNAE/região instead of being generic.
10. **Negative test:** start the server with a garbage `GROWTHOS_API_KEY`.
    Expect it to exit immediately with "GROWTHOS_API_KEY inválida" on stderr,
    not silently fall back to any workspace.
11. **HTTP transport:** `npm run dev`, then `curl -X POST
    http://localhost:3000/api/mcp -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`
    with no `Authorization` header — expect `401` with a clear error message
    (confirmed working: this doesn't even need a real DB, since a missing key
    short-circuits before any lookup). Repeat with `-H "Authorization: Bearer
    gos_live_..."` using a real key from step 2 — expect the same 8 tools as
    the stdio transport.

## Security notes

- **Per-workspace authorization is now real** (this used to be the #1 open
  risk — see the strategic report). A leaked key only exposes the one
  workspace it belongs to, not "any workspace whose UUID you can guess."
- **What's still open:** key revocation has no CLI (direct SQL only), there's
  no rate limiting, and this only covers the *MCP* path. The existing Next.js
  browser routes (`/api/agent`, `/api/brand-research`, `/api/maturity/score`,
  `/api/onboarding/section`) still accept a client-supplied `workspaceId`
  with zero auth check — they need session-based auth (next-auth, installed
  but never wired up) since they're called by the browser, not by a
  credentialed machine client. That's a different-shaped problem from this
  API-key model and wasn't in scope for this pass.
