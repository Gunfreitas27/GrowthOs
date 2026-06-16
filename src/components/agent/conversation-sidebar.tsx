'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationItem {
  id: string
  title: string | null
  createdAt: string
  _count: { messages: number }
}

interface ConversationSidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/agent/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [activeConversationId])

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await fetch('/api/agent/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) onNewConversation()
  }

  return (
    <div
      className="w-64 h-screen flex flex-col border-r shrink-0"
      style={{
        background: 'rgba(15, 14, 26, 0.8)',
        borderColor: 'rgba(107, 79, 232, 0.15)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
      >
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(107,79,232,0.25), rgba(26,211,197,0.1))',
            border: '1px solid rgba(107, 79, 232, 0.35)',
            color: '#F8F7FC',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <Plus className="w-4 h-4" style={{ color: 'var(--velox-pulse)' }} />
          Nova estratégia
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <p
          className="px-2 py-1.5 text-xs uppercase tracking-widest mb-1"
          style={{ color: 'rgba(168, 163, 199, 0.4)', fontFamily: 'var(--font-ui)' }}
        >
          Histórico
        </p>

        {loading ? (
          <div className="space-y-1.5 px-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 rounded-md animate-pulse"
                style={{ background: 'rgba(107, 79, 232, 0.06)' }}
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <MessageSquare
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: 'rgba(168, 163, 199, 0.3)' }}
            />
            <p className="text-xs" style={{ color: 'rgba(168, 163, 199, 0.4)', fontFamily: 'var(--font-ui)' }}>
              Nenhuma conversa ainda
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                'group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all text-xs',
                activeConversationId === conv.id ? 'text-white' : 'text-[#A8A3C7] hover:text-white'
              )}
              style={
                activeConversationId === conv.id
                  ? {
                      background: 'rgba(107, 79, 232, 0.18)',
                      border: '1px solid rgba(107, 79, 232, 0.3)',
                    }
                  : { border: '1px solid transparent' }
              }
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate" style={{ fontFamily: 'var(--font-ui)' }}>
                {conv.title ?? 'Conversa sem título'}
              </span>
              <button
                onClick={(e) => deleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                style={{ color: 'rgba(239, 68, 68, 0.7)' }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div
        className="p-3 border-t"
        style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
      >
        <p
          className="text-xs text-center"
          style={{ color: 'rgba(168, 163, 199, 0.3)', fontFamily: 'var(--font-ui)' }}
        >
          Cmd+K · nova conversa
        </p>
      </div>
    </div>
  )
}
