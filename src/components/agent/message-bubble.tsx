'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface ToolCallInfo {
  toolName: string
  toolCallId: string
  agentLabel: string
  status: 'running' | 'done'
  durationMs?: number
}

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallInfo[]
  isStreaming?: boolean
}

const AGENT_ICONS: Record<string, string> = {
  market_intelligence: '🔍',
  icp_builder: '👥',
  channel_strategist: '📡',
  growth_loops: '🔄',
  experiment_generator: '⚗️',
  funnel_diagnostician: '🎯',
  forecast_modeler: '📈',
  retention_specialist: '♻️',
  content_strategist: '✍️',
  pricing_optimizer: '💰',
  get_funnel_data: '📊',
  get_experiments: '🧪',
  get_learnings: '📚',
  create_experiment: '✅',
}

function ToolCallCard({ tool }: { tool: ToolCallInfo }) {
  const icon = AGENT_ICONS[tool.toolName] ?? '🤖'
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs my-1.5"
      style={{
        background: 'rgba(107, 79, 232, 0.08)',
        border: '1px solid rgba(107, 79, 232, 0.2)',
        color: 'var(--velox-mist)',
      }}
    >
      <span>{icon}</span>
      <span style={{ color: 'var(--velox-pulse)' }}>{tool.agentLabel}</span>
      {tool.status === 'running' ? (
        <span className="flex gap-0.5 items-center ml-auto">
          <span
            className="w-1 h-1 rounded-full animate-bounce"
            style={{ background: 'var(--velox-pulse)', animationDelay: '0ms' }}
          />
          <span
            className="w-1 h-1 rounded-full animate-bounce"
            style={{ background: 'var(--velox-pulse)', animationDelay: '150ms' }}
          />
          <span
            className="w-1 h-1 rounded-full animate-bounce"
            style={{ background: 'var(--velox-pulse)', animationDelay: '300ms' }}
          />
        </span>
      ) : (
        <span className="ml-auto" style={{ color: 'var(--velox-velocity)' }}>
          ✓ {tool.durationMs ? `${(tool.durationMs / 1000).toFixed(1)}s` : ''}
        </span>
      )}
    </div>
  )
}

// Strip QUICK_ACTIONS line from display
function cleanContent(content: string): string {
  return content.replace(/QUICK_ACTIONS:\s*\[[\s\S]*?\]\s*$/, '').trim()
}

export function MessageBubble({
  role,
  content,
  toolCalls,
  isStreaming,
}: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-2xl px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
          style={{
            background: 'rgba(107, 79, 232, 0.2)',
            border: '1px solid rgba(107, 79, 232, 0.3)',
            color: '#F8F7FC',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  const displayContent = cleanContent(content)

  return (
    <div className="mb-6">
      {/* Velox badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #6B4FE8, #1AD3C5)',
            color: 'white',
            fontFamily: 'var(--font-display)',
          }}
        >
          V
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--velox-pulse)', fontFamily: 'var(--font-display)' }}
        >
          Velox AI
        </span>
      </div>

      {/* Tool call cards */}
      {toolCalls && toolCalls.length > 0 && (
        <div className="mb-3">
          {toolCalls.map((tc) => (
            <ToolCallCard key={tc.toolCallId} tool={tc} />
          ))}
        </div>
      )}

      {/* Message content */}
      {displayContent && (
        <div
          className={cn(
            'prose prose-invert max-w-none text-sm leading-relaxed',
            'prose-headings:text-white prose-headings:font-semibold',
            'prose-strong:text-white prose-code:text-[var(--velox-velocity)]',
            'prose-blockquote:border-[var(--velox-pulse)] prose-blockquote:text-[var(--velox-mist)]',
            'prose-table:text-sm prose-th:text-[var(--velox-cloud)] prose-td:text-[var(--velox-mist)]',
            'prose-a:text-[var(--velox-pulse)] prose-li:text-[var(--velox-cloud)]',
            'prose-p:text-[var(--velox-cloud)]'
          )}
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
          {isStreaming && (
            <span
              className="inline-block w-0.5 h-4 ml-0.5 animate-pulse"
              style={{ background: 'var(--velox-pulse)', verticalAlign: 'middle' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
