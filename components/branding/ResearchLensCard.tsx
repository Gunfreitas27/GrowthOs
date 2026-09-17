'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseLensSummary } from '@/lib/agents/parse-lens-summary';
import { markdownComponents } from './markdown-components';

export interface ResearchLensCardProps {
  label: string;
  result: string | null;
  error?: string;
}

// Plain-text teaser for reports that didn't produce a parsed headline (old
// data saved before the "## Resumo" format existed, or a free-tier model
// that ignored the instruction). Rendering the full markdown clipped via
// line-clamp doesn't work reliably across nested block elements (headers,
// tables), so this strips markdown syntax down to a flat sentence instead.
function stripMarkdownPreview(text: string, maxLen = 220): string {
  const flat = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > maxLen ? `${flat.slice(0, maxLen).trim()}…` : flat;
}

function ResearchLensCard({ label, result, error }: ResearchLensCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { headline, metric, bullets, fullReport } = parseLensSummary(result);

  if (error) {
    return (
      <div className="rounded-md border border-danger/30 bg-danger/5 p-4">
        <p className="text-xs font-semibold text-danger mb-1">{label}</p>
        <p className="text-xs text-muted-foreground">Falha ao gerar esta análise: {error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{label}</p>

      {headline ? (
        <>
          <p className="text-sm font-medium text-foreground leading-snug">{headline}</p>
          {metric && (
            <Badge variant="primary" className="mt-2">
              {metric}
            </Badge>
          )}
          {bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {bullets.map((bullet, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        fullReport && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stripMarkdownPreview(fullReport)}
          </p>
        )
      )}

      {fullReport && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
        >
          {expanded ? 'Ocultar análise completa' : 'Ver análise completa'}
          <ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}

      {expanded && fullReport && (
        <div className="mt-3 pt-3 border-t border-border">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {fullReport}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export { ResearchLensCard };
