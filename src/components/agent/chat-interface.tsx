'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { QuickActions } from './quick-actions'
import { ConversationSidebar } from './conversation-sidebar'
import type { QuickAction } from '@/lib/agents/types'

interface ToolCallState {
  toolName: string
  toolCallId: string
  agentLabel: string
  status: 'running' | 'done'
  durationMs?: number
}

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallState[]
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  userName: string
  orgName: string
}

export function ChatInterface({ userName, orgName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [lastQuickActions, setLastQuickActions] = useState<QuickAction[]>([])
  const [activeToolCalls, setActiveToolCalls] = useState<Map<string, ToolCallState>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeToolCalls.size])

  // Keyboard shortcut: Cmd+K for new conversation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleNewConversation()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }

  const handleNewConversation = useCallback(() => {
    if (isStreaming) abortRef.current?.abort()
    setMessages([])
    setConversationId(null)
    setLastQuickActions([])
    setActiveToolCalls(new Map())
    setInput('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [isStreaming])

  const handleSelectConversation = async (id: string) => {
    if (isStreaming) abortRef.current?.abort()
    setConversationId(id)
    setActiveToolCalls(new Map())
    setLastQuickActions([])

    // Load conversation messages
    try {
      const res = await fetch(`/api/agent/conversations/${id}/messages`)
      if (res.ok) {
        const data = await res.json() as Array<{ id: string; role: string; content: string }>
        const loaded: DisplayMessage[] = data.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
        setMessages(loaded)
      }
    } catch {
      // ignore
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)
    setActiveToolCalls(new Map())

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: DisplayMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      isStreaming: true,
    }
    setMessages((prev) => [...prev, assistantMsg])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, conversationId }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const currentToolCalls = new Map<string, ToolCallState>()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr)

            if (event.type === 'conversation_id') {
              setConversationId(event.conversationId)
            }

            if (event.type === 'text_delta') {
              assistantContent += event.delta
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: assistantContent }
                    : m
                )
              )
            }

            if (event.type === 'tool_use_start') {
              const tc: ToolCallState = {
                toolName: event.toolName,
                toolCallId: event.toolCallId,
                agentLabel: event.agentLabel,
                status: 'running',
              }
              currentToolCalls.set(event.toolCallId, tc)
              setActiveToolCalls(new Map(currentToolCalls))
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, toolCalls: Array.from(currentToolCalls.values()) }
                    : m
                )
              )
            }

            if (event.type === 'tool_result') {
              const tc = currentToolCalls.get(event.toolCallId)
              if (tc) {
                tc.status = 'done'
                tc.durationMs = event.durationMs
                currentToolCalls.set(event.toolCallId, tc)
                setActiveToolCalls(new Map(currentToolCalls))
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, toolCalls: Array.from(currentToolCalls.values()) }
                      : m
                  )
                )
              }
            }

            if (event.type === 'message_complete') {
              if (event.quickActions?.length > 0) {
                setLastQuickActions(event.quickActions)
              }
              if (event.conversationId) {
                setConversationId(event.conversationId)
              }
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      )
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Erro ao conectar com o agente. Verifique a chave da API e tente novamente.',
                isStreaming: false,
              }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      setActiveToolCalls(new Map())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  const isEmptyState = messages.length === 0

  return (
    <div className="flex h-full" style={{ background: 'var(--velox-void)' }}>
      {/* Conversation sidebar */}
      <ConversationSidebar
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6B4FE8, #1AD3C5)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1
              className="text-sm font-semibold"
              style={{ color: '#F8F7FC', fontFamily: 'var(--font-display)' }}
            >
              Velox AI
            </h1>
            <p className="text-xs" style={{ color: 'var(--velox-mist)', fontFamily: 'var(--font-ui)' }}>
              Growth Intelligence · {orgName}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--velox-velocity)' }}
            />
            <span className="text-xs" style={{ color: 'var(--velox-velocity)', fontFamily: 'var(--font-ui)' }}>
              10 agentes ativos
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {isEmptyState ? (
            <EmptyState userName={userName} onAction={handleQuickAction} />
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  toolCalls={msg.toolCalls}
                  isStreaming={msg.isStreaming}
                />
              ))}
              {/* Quick actions after last assistant message */}
              {!isStreaming && lastQuickActions.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
                <div className="mt-4 mb-2">
                  <QuickActions actions={lastQuickActions} onAction={handleQuickAction} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
        >
          {/* Quick actions in empty state */}
          {isEmptyState && (
            <div className="max-w-3xl mx-auto mb-4">
              <QuickActions actions={[]} onAction={handleQuickAction} />
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(107, 79, 232, 0.06)',
                border: `1px solid ${isStreaming ? 'rgba(107, 79, 232, 0.4)' : 'rgba(107, 79, 232, 0.2)'}`,
                transition: 'border-color 0.2s',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre crescimento, estratégia, mercado, canais..."
                disabled={isStreaming}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed placeholder-[#A8A3C7]/50"
                style={{
                  color: '#F8F7FC',
                  fontFamily: 'var(--font-ui)',
                  maxHeight: '120px',
                  minHeight: '24px',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: input.trim() && !isStreaming
                    ? 'linear-gradient(135deg, #6B4FE8, #1AD3C5)'
                    : 'rgba(107, 79, 232, 0.2)',
                }}
              >
                {isStreaming ? (
                  <span
                    className="w-3 h-3 rounded-sm animate-pulse"
                    style={{ background: 'var(--velox-pulse)' }}
                  />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
            <p
              className="text-center text-xs mt-2"
              style={{ color: 'rgba(168, 163, 199, 0.3)', fontFamily: 'var(--font-ui)' }}
            >
              Enter para enviar · Shift+Enter para nova linha · Cmd+K para nova conversa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  userName,
  onAction,
}: {
  userName: string
  onAction: (prompt: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #6B4FE8, #1AD3C5)' }}
      >
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{
          color: '#F8F7FC',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
        }}
      >
        Olá, {userName.split(' ')[0]}
      </h2>
      <p
        className="text-sm mb-1 max-w-sm"
        style={{ color: 'var(--velox-mist)', fontFamily: 'var(--font-ui)' }}
      >
        Sou o Velox — seu estrategista de crescimento com IA.
      </p>
      <p
        className="text-sm mb-8 max-w-sm"
        style={{ color: 'rgba(168, 163, 199, 0.5)', fontFamily: 'var(--font-ui)' }}
      >
        Tenho acesso aos seus dados, 10 agentes especializados e frameworks de crescimento de ponta.
      </p>

      {/* Capability badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-lg">
        {[
          '🔍 Inteligência de Mercado',
          '👥 ICP & Personas',
          '📡 Estratégia de Canais',
          '🔄 Growth Loops',
          '⚗️ Gerador de Experimentos',
          '🎯 Diagnóstico de Funil',
          '📈 Forecast & Cenários',
          '♻️ Retenção & Churn',
          '✍️ Estratégia de Conteúdo',
          '💰 Otimização de Pricing',
        ].map((badge) => (
          <span
            key={badge}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(107, 79, 232, 0.08)',
              border: '1px solid rgba(107, 79, 232, 0.2)',
              color: 'var(--velox-mist)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  )
}
