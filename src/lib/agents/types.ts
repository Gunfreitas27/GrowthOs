import type { Tool, MessageParam } from '@anthropic-ai/sdk/resources/messages'

export interface OrgContext {
  orgName: string
  funnelSummary: string
  experimentSummary: string
  learningSummary: string
  channelSummary: string
  velocitySummary: string
}

export interface SubAgentPayload {
  agentName: string
  systemPrompt: string
  userMessage: string
  maxTokens?: number
}

export type SSEEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_use_start'; toolName: string; toolCallId: string; agentLabel: string }
  | { type: 'tool_result'; toolCallId: string; toolName: string; durationMs: number }
  | { type: 'message_complete'; conversationId: string; quickActions: QuickAction[] }
  | { type: 'error'; message: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }

export interface QuickAction {
  label: string
  prompt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ConversationWithMessages {
  id: string
  title: string | null
  createdAt: Date
  messages: StoredMessage[]
}

export interface StoredMessage {
  id: string
  role: string
  content: string
  toolName: string | null
  toolCallId: string | null
  agentUsed: string | null
  createdAt: Date
}

export { Tool, MessageParam }
