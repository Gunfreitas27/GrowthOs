import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools';

// One server instance = one authenticated workspace (see stdio.ts). Tools
// never take workspaceId as an argument — see the note at the top of tools.ts.
export function createServer(workspaceId: string): McpServer {
  const server = new McpServer({
    name: 'growthos',
    version: '0.2.0-poc',
  });

  registerTools(server, workspaceId);

  return server;
}
