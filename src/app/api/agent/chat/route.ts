import { auth } from '@/auth'
import { buildOrgContext } from '@/lib/agents/context-builder'
import { GrowthOrchestrator } from '@/lib/agents/orchestrator'
import { prisma } from '@/lib/prisma'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export const maxDuration = 120

function generateTitle(firstMessage: string): string {
  const words = firstMessage.split(' ').slice(0, 6).join(' ')
  return words.length < firstMessage.length ? `${words}...` : words
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.organizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, conversationId } = await req.json() as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    conversationId?: string
  }

  if (!messages || messages.length === 0) {
    return new Response('Messages required', { status: 400 })
  }

  const organizationId = session.user.organizationId
  const userId = session.user.id

  // Get or create conversation
  let conversation
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, organizationId },
    })
  }

  if (!conversation) {
    const title = generateTitle(messages[messages.length - 1]?.content ?? '')
    conversation = await prisma.conversation.create({
      data: { title, organizationId, userId },
    })
  }

  // Save user message
  const lastUserMessage = messages[messages.length - 1]
  if (lastUserMessage?.role === 'user') {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: lastUserMessage.content,
      },
    })
  }

  // Build org context
  const orgContext = await buildOrgContext(organizationId)

  // Convert to Anthropic message format
  const anthropicMessages: MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const encoder = new TextEncoder()
  const orchestrator = new GrowthOrchestrator()

  let assistantText = ''
  const toolEvents: Array<{ toolName: string; toolCallId: string }> = []

  const readableStream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send conversation ID immediately
      send({ type: 'conversation_id', conversationId: conversation!.id })

      try {
        for await (const event of orchestrator.stream(
          anthropicMessages,
          orgContext,
          organizationId,
          userId
        )) {
          if (event.type === 'text_delta') {
            assistantText += event.delta
          }
          if (event.type === 'tool_use_start') {
            toolEvents.push({ toolName: event.toolName, toolCallId: event.toolCallId })
          }
          if (event.type === 'message_complete') {
            // Update conversation ID in the event
            const eventWithId = { ...event, conversationId: conversation!.id }
            send(eventWithId)

            // Strip QUICK_ACTIONS from stored text
            const cleanText = assistantText
              .replace(/QUICK_ACTIONS:\s*\[[\s\S]*?\]\s*$/, '')
              .trim()

            // Save assistant message to DB
            await prisma.message.create({
              data: {
                conversationId: conversation!.id,
                role: 'assistant',
                content: cleanText,
                agentUsed: toolEvents.map((t) => t.toolName).join(',') || null,
              },
            })

            continue
          }
          send(event)
        }
      } catch (error) {
        console.error('Orchestrator error:', error)
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'An error occurred',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
