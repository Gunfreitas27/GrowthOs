import { invokeSkill } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';
import { buildWorkspaceContext } from '@/lib/business-context/graph';

export interface AdvisoryBoardTurn {
  role: 'user' | 'assistant';
  content: string;
}

// Single-shot, non-streaming version of the advisory-board conversation.
// Unlike lib/agents/orchestrator.ts#streamOrchestrator, this does NOT persist
// chat_messages or run module-unlock side effects — it's a pure ask/answer
// meant for callers outside the product's own chat UI (e.g. an MCP tool),
// where writing to a stranger's conversation history isn't yet a safe default.
export async function askAdvisoryBoard(
  workspaceId: string,
  message: string,
  conversationHistory: AdvisoryBoardTurn[] = []
): Promise<{ answer: string; model: string }> {
  const ctx = await buildWorkspaceContext(workspaceId);

  const historyText = conversationHistory.length
    ? conversationHistory
        .map((t) => `${t.role === 'user' ? 'Usuário' : 'Advisory Board'}: ${t.content}`)
        .join('\n\n')
    : undefined;

  const result = await invokeSkill(
    'advisory-board',
    {
      task: message,
      context: historyText,
    },
    ctx,
    MODELS.advanced
  );

  if (!result.ok) {
    throw new Error(`advisory-board failed: ${result.reason}`);
  }

  return { answer: result.content, model: result.model };
}
