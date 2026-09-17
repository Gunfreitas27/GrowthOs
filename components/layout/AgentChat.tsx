'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageContent, SSEChunk } from '@/lib/agents/types';
import MessageRenderer from '@/components/chat/MessageRenderer';
import { Logo } from '@/components/brand/Logo';
import { ChatBubble } from '@/components/ui/chat-bubble';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: MessageContent[];
  createdAt: Date;
}

interface AgentChatProps {
  onModuleUnlock?: (moduleKey: string) => void;
}

export default function AgentChat({ onModuleUnlock }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: [{ type: 'text', text: input.trim() }],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    let accumulatedText = '';

    // Add placeholder assistant message
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: [{ type: 'text', text: '' }],
        createdAt: new Date(),
      },
    ]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content[0] }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const chunk = JSON.parse(raw) as SSEChunk;

            if (chunk.type === 'delta') {
              accumulatedText += chunk.data as string;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: [{ type: 'text', text: accumulatedText }] }
                    : m
                )
              );
            } else if (chunk.type === 'module_unlock') {
              const unlock = chunk.data as MessageContent;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: [...m.content, unlock] }
                    : m
                )
              );
              if (unlock.type === 'module_unlock') {
                onModuleUnlock?.(unlock.moduleKey);
              }
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: [{ type: 'text', text: 'Erro ao conectar ao agente. Tente novamente.' }],
                }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, onModuleUnlock]);

  return (
    <div
      className={cn(
        'flex flex-col h-screen border-l border-border bg-surface-soft transition-all duration-200',
        collapsed ? 'w-10' : 'w-[var(--chat-width)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Logo variant="icon" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Growth Agent</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-surface-strong text-muted-foreground transition-colors"
        >
          <ChevronRight
            size={14}
            className={cn('transition-transform', collapsed ? 'rotate-180' : '')}
          />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Logo variant="icon" size={32} className="text-primary opacity-60 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Olá! Sou seu Growth Agent.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comece pelo diagnóstico de maturidade para eu entender seu negócio.
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role}>
                {msg.content.map((c, i) => (
                  <MessageRenderer key={i} content={c} />
                ))}
              </ChatBubble>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2 items-end">
              <Textarea
                className="min-h-[36px] max-h-32 py-2"
                placeholder="Pergunte ao agente..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
              />
              <Button
                size="sm"
                className="px-2.5 shrink-0"
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
