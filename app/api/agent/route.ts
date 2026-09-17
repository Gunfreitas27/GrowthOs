import { NextRequest } from 'next/server';
import { streamOrchestrator } from '@/lib/agents/orchestrator';
import { buildWorkspaceContext } from '@/lib/business-context/graph';
import { db, chatMessages } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { MessageContent } from '@/lib/agents/types';
import { IS_MOCK } from '@/lib/mock/resolver';
import { MOCK_BUSINESS_CONTEXT, MOCK_MATURITY_SCORES } from '@/lib/mock/data';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simulated streaming response for mock mode
async function* mockOrchestratorStream(userMessage: string) {
  const responses: Record<string, string> = {
    default: `Com base no diagnóstico da **Delfo**, identifiquei os seguintes insights estratégicos:

**Pontos fortes:**
- Diferenciação Competitiva (3.8/5) — posicionamento único no mercado de growth tech
- CRM & Lifecycle (3.5/5) — boa fundação de retenção

**Gaps prioritários:**
- Orgânico & Conteúdo (2.1/5) — oportunidade imediata de SEO e content marketing
- Analytics & Atribuição (2.4/5) — tracking precisa ser fortalecido

**Recomendação para os próximos 90 dias:**
1. Investir em SEO técnico e content marketing (ROI alto, CAC baixo)
2. Implementar UTMs e atribuição cross-canal
3. Testar novos ângulos de criativo no Google Ads

Quer que eu elabore o plano de 90 dias?`,
  };

  const text = responses[userMessage.toLowerCase()] ?? responses.default;
  const words = text.split(' ');

  for (const word of words) {
    yield { type: 'delta' as const, data: word + ' ' };
    await new Promise((r) => setTimeout(r, 30));
  }

  yield { type: 'done' as const, data: text };
}

export async function POST(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  const { message } = await req.json() as { message: MessageContent };

  if (!message) {
    return new Response('Missing message', { status: 400 });
  }

  const userText = message.type === 'text' ? message.text : JSON.stringify(message);

  // Mock mode: stream a pre-defined response without hitting OpenRouter or DB
  if (IS_MOCK) {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (chunk: string) => controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));

        for await (const chunk of mockOrchestratorStream(userText)) {
          send(JSON.stringify(chunk));
        }
        send('[DONE]');
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  }

  // Production path
  const history = await db.query.chatMessages.findMany({
    where: eq(chatMessages.workspaceId, workspaceId),
    orderBy: (t, { desc }) => desc(t.createdAt),
    limit: 10,
    columns: { role: true, content: true },
  });

  const conversationHistory = history.reverse().map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
  }));

  await db.insert(chatMessages).values({
    workspaceId,
    role: 'user',
    content: { type: 'text', text: userText },
    messageType: 'text',
  });

  const ctx = await buildWorkspaceContext(workspaceId);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullResponse = '';
      const send = (chunk: string) => controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));

      try {
        for await (const sseChunk of streamOrchestrator({ userMessage: userText, conversationHistory }, ctx)) {
          if (sseChunk.type === 'delta') {
            fullResponse += sseChunk.data as string;
            send(JSON.stringify(sseChunk));
          } else if (sseChunk.type === 'module_unlock') {
            send(JSON.stringify(sseChunk));
          } else if (sseChunk.type === 'done') {
            await db.insert(chatMessages).values({
              workspaceId,
              role: 'assistant',
              content: { type: 'text', text: fullResponse },
              messageType: 'text',
            });
            send('[DONE]');
          }
        }
      } catch {
        send(JSON.stringify({ type: 'error', data: 'Internal agent error' }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
