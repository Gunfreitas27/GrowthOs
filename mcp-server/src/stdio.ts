import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';
import { resolveWorkspaceFromApiKey } from '@/lib/auth/api-keys';

async function main() {
  const apiKey = process.env.GROWTHOS_API_KEY;
  if (!apiKey) {
    console.error(
      '[growthos-mcp] GROWTHOS_API_KEY não definida. Gere uma com:\n' +
        '  npm run create-api-key -- <workspaceId> "<nome>"'
    );
    process.exit(1);
  }

  const workspaceId = await resolveWorkspaceFromApiKey(apiKey);
  if (!workspaceId) {
    console.error('[growthos-mcp] GROWTHOS_API_KEY inválida, não encontrada ou revogada.');
    process.exit(1);
  }

  const server = createServer(workspaceId);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP stdio servers must never write to stdout except protocol frames —
  // stderr is safe for our own diagnostics.
  console.error(`[growthos-mcp] listening on stdio — workspace ${workspaceId}`);
}

main().catch((err) => {
  console.error('[growthos-mcp] fatal error:', err);
  process.exit(1);
});
