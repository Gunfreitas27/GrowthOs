'use client';

import type { MessageContent } from '@/lib/agents/types';
import { Unlock, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  content: MessageContent;
}

export default function MessageRenderer({ content }: Props) {
  if (content.type === 'text') {
    return (
      <p className="whitespace-pre-wrap leading-relaxed">{content.text}</p>
    );
  }

  if (content.type === 'module_unlock') {
    return (
      <div className="flex items-start gap-2 p-2 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/30 mt-1">
        <Unlock size={14} className="text-[var(--primary)] mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">
            Módulo Desbloqueado
          </p>
          <p className="text-sm mt-0.5">{content.message}</p>
        </div>
      </div>
    );
  }

  if (content.type === 'insight') {
    return (
      <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 mt-1">
        <TrendingUp size={14} className="text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
            {content.title}
          </p>
          <p className="text-sm mt-0.5">{content.body}</p>
          {content.score !== undefined && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Score: {content.score.toFixed(1)}/5.0
            </p>
          )}
        </div>
      </div>
    );
  }

  if (content.type === 'research_progress') {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--muted)] mt-1">
        <div
          className={`w-2 h-2 rounded-full ${
            content.status === 'running'
              ? 'bg-blue-400 animate-pulse'
              : content.status === 'done'
              ? 'bg-green-400'
              : 'bg-red-400'
          }`}
        />
        <span className="text-xs text-[var(--muted-foreground)]">
          {content.lens}: {content.status === 'running' ? 'analisando...' : content.summary ?? content.status}
        </span>
      </div>
    );
  }

  if (content.type === 'action_request') {
    return (
      <div className="p-3 rounded-md bg-orange-500/10 border border-orange-500/30 mt-1">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={14} className="text-orange-400" />
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
            Ação Requerida — {content.platform}
          </p>
        </div>
        <p className="text-sm font-medium">{content.title}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{content.description}</p>
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 rounded-md bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
            Aprovar
          </button>
          <button className="px-3 py-1.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] text-xs hover:text-[var(--foreground)] transition-colors">
            Rejeitar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
