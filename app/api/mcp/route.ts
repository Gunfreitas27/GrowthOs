import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from '@/mcp-server/src/server';
import { resolveWorkspaceFromApiKey } from '@/lib/auth/api-keys';
import { checkRateLimit } from '@/lib/rate-limit';

// The hosted counterpart of mcp-server/src/stdio.ts — same tools (same
// registerTools call), different transport. Stateless: one McpServer +
// transport per request, matching how Vercel functions work (no long-lived
// process to hold a session in memory across requests). See
// mcp-server/README.md for the local/stdio path and its security notes.

export const runtime = 'nodejs';
export const maxDuration = 60; // run_brand_research: 4 sequential LLM calls

const RATE_LIMIT_PER_MINUTE = 60;

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handle(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization');
  const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  // Same resolution as the stdio transport (lib/auth/api-keys.ts): the key
  // itself determines the workspace, never a client-supplied argument.
  const workspaceId = await resolveWorkspaceFromApiKey(apiKey);
  if (!workspaceId) {
    return jsonError(401, 'Missing or invalid Authorization: Bearer <GROWTHOS_API_KEY>');
  }

  const rateLimit = await checkRateLimit(`mcp:${workspaceId}`, RATE_LIMIT_PER_MINUTE);
  if (!rateLimit.allowed) {
    return jsonError(429, `Rate limit exceeded (${RATE_LIMIT_PER_MINUTE} requests/min per workspace)`);
  }

  const server = createServer(workspaceId);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode — no session to track
  });

  await server.connect(transport);
  return transport.handleRequest(req);
}

export { handle as GET, handle as POST, handle as DELETE };
