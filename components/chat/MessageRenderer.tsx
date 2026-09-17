'use client';

import type { MessageContent } from '@/lib/agents/types';
import { InsightCard } from '@/components/ui/insight-card';

interface Props {
  content: MessageContent;
}

export default function MessageRenderer({ content }: Props) {
  if (content.type === 'text') {
    return <p className="whitespace-pre-wrap leading-relaxed">{content.text}</p>;
  }

  if (content.type === 'module_unlock') {
    return (
      <InsightCard
        kind="module_unlock"
        title="Módulo Desbloqueado"
        body={content.message}
        className="mt-1"
      />
    );
  }

  if (content.type === 'insight') {
    return (
      <InsightCard
        kind="insight"
        title={content.title}
        body={content.body}
        meta={content.score !== undefined ? `Score: ${content.score.toFixed(1)}/5.0` : undefined}
        className="mt-1"
      />
    );
  }

  if (content.type === 'research_progress') {
    // The underlying status carries three distinct states (running/done/
    // error) that predate the 4-kind InsightCard family — mapped onto the
    // closest kind so the color signal (blue-pulse/green/red) survives:
    // still-running research keeps the dedicated research_progress kind
    // (spinning icon), a finished lens reads as a positive insight, and a
    // failed lens borrows action_request's danger accent (no actions).
    if (content.status === 'done') {
      return (
        <InsightCard kind="insight" title={content.lens} body={content.summary ?? 'Concluído'} className="mt-1" />
      );
    }
    if (content.status === 'error') {
      return (
        <InsightCard
          kind="action_request"
          title={`${content.lens} — falhou`}
          body={content.summary}
          className="mt-1"
        />
      );
    }
    return (
      <InsightCard kind="research_progress" title={content.lens} body="Analisando..." className="mt-1" />
    );
  }

  if (content.type === 'action_request') {
    return (
      <InsightCard
        kind="action_request"
        title={`Ação Requerida — ${content.platform}`}
        body={
          <>
            <p className="font-medium text-foreground">{content.title}</p>
            <p className="mt-1">{content.description}</p>
          </>
        }
        actions={[
          { label: 'Aprovar', onClick: () => {}, variant: 'primary' },
          { label: 'Rejeitar', onClick: () => {}, variant: 'secondary' },
        ]}
        className="mt-1"
      />
    );
  }

  return null;
}
