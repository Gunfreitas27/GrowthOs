import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam, ContentBlock } from '@anthropic-ai/sdk/resources/messages'
import { buildSystemPrompt } from './system-prompt'
import { allTools, executeTool } from './tools'
import type { SSEEvent, OrgContext, QuickAction } from './types'

const AGENT_LABELS: Record<string, string> = {
  market_intelligence: 'Market Intelligence',
  icp_builder: 'ICP Builder',
  channel_strategist: 'Channel Strategist',
  growth_loops: 'Growth Loops',
  experiment_generator: 'Experiment Generator',
  funnel_diagnostician: 'Funnel Diagnostician',
  forecast_modeler: 'Forecast Modeler',
  retention_specialist: 'Retention Specialist',
  content_strategist: 'Content Strategist',
  pricing_optimizer: 'Pricing Optimizer',
  get_funnel_data: 'Velox Data',
  get_experiments: 'Velox Data',
  get_learnings: 'Velox Data',
  create_experiment: 'Velox Action',
}

export class GrowthOrchestrator {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async *stream(
    messages: MessageParam[],
    orgContext: OrgContext,
    organizationId: string,
    userId: string
  ): AsyncGenerator<SSEEvent> {
    const systemPrompt = buildSystemPrompt(orgContext)
    let conversationMessages = [...messages]
    let fullText = ''
    let inputTokens = 0
    let outputTokens = 0

    // Agentic loop — continues until stop_end (no more tool calls)
    while (true) {
      const stream = this.client.messages.stream({
        model: 'claude-opus-4-8',
        max_tokens: 8096,
        system: systemPrompt,
        tools: allTools,
        messages: conversationMessages,
      })

      const toolCallsInFlight: Map<
        string,
        { name: string; inputJson: string }
      > = new Map()

      let currentToolCallId: string | null = null
      let stopReason: string | null = null
      const assistantContentBlocks: ContentBlock[] = []

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          const block = event.content_block
          if (block.type === 'text') {
            // Text block started
          } else if (block.type === 'tool_use') {
            currentToolCallId = block.id
            toolCallsInFlight.set(block.id, { name: block.name, inputJson: '' })
            yield {
              type: 'tool_use_start',
              toolName: block.name,
              toolCallId: block.id,
              agentLabel: AGENT_LABELS[block.name] ?? block.name,
            }
          }
        }

        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            fullText += event.delta.text
            yield { type: 'text_delta', delta: event.delta.text }
          } else if (event.delta.type === 'input_json_delta' && currentToolCallId) {
            const tc = toolCallsInFlight.get(currentToolCallId)
            if (tc) tc.inputJson += event.delta.partial_json
          }
        }

        if (event.type === 'content_block_stop') {
          currentToolCallId = null
        }

        if (event.type === 'message_delta') {
          stopReason = event.delta.stop_reason ?? null
          if (event.usage) {
            outputTokens += event.usage.output_tokens
          }
        }

        if (event.type === 'message_start' && event.message.usage) {
          inputTokens += event.message.usage.input_tokens
        }
      }

      // Collect final message for conversation history
      const finalMessage = await stream.finalMessage()
      assistantContentBlocks.push(...finalMessage.content)

      // Add assistant turn to conversation
      conversationMessages.push({
        role: 'assistant',
        content: assistantContentBlocks,
      })

      // If no tool calls, we're done
      if (stopReason !== 'tool_use' || toolCallsInFlight.size === 0) {
        break
      }

      // Execute all tool calls and collect results
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

      for (const [toolCallId, { name, inputJson }] of toolCallsInFlight) {
        const startMs = Date.now()
        let toolInput: Record<string, unknown> = {}
        try {
          toolInput = JSON.parse(inputJson || '{}')
        } catch {
          toolInput = {}
        }

        const result = await executeTool(name, toolInput, organizationId, userId)
        const durationMs = Date.now() - startMs

        yield {
          type: 'tool_result',
          toolCallId,
          toolName: name,
          durationMs,
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCallId,
          content: result,
        })
      }

      // Add tool results and continue the loop
      conversationMessages.push({
        role: 'user',
        content: toolResults,
      })
    }

    // Emit usage
    yield { type: 'usage', inputTokens, outputTokens }

    // Parse quick actions from the last line of the response
    const quickActions = parseQuickActions(fullText)
    yield {
      type: 'message_complete',
      conversationId: '',
      quickActions,
    }
  }
}

function parseQuickActions(text: string): QuickAction[] {
  try {
    const match = text.match(/QUICK_ACTIONS:\s*(\[[\s\S]*?\])\s*$/)
    if (match?.[1]) {
      return JSON.parse(match[1]) as QuickAction[]
    }
  } catch {
    // ignore parse errors
  }
  return []
}
