import * as React from 'react';
import { Unlock, TrendingUp, Loader2, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './progress-bar';
import { Button } from './button';

export type InsightCardKind = 'module_unlock' | 'insight' | 'research_progress' | 'action_request';

const KIND_CONFIG: Record<InsightCardKind, { icon: LucideIcon; accent: string }> = {
  module_unlock: { icon: Unlock, accent: 'text-primary' },
  insight: { icon: TrendingUp, accent: 'text-success' },
  research_progress: { icon: Loader2, accent: 'text-warning' },
  action_request: { icon: AlertCircle, accent: 'text-danger' },
};

export interface InsightCardAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface InsightCardProps {
  kind: InsightCardKind;
  title: string;
  body?: React.ReactNode;
  meta?: React.ReactNode;
  progress?: number;
  actions?: InsightCardAction[];
  className?: string;
}

function InsightCard({ kind, title, body, meta, progress, actions, className }: InsightCardProps) {
  const { icon: Icon, accent } = KIND_CONFIG[kind];
  return (
    <div className={cn('relative rounded-md bg-card shadow-elevated p-5', className)}>
      <Icon
        size={16}
        className={cn('absolute top-4 right-4', accent, kind === 'research_progress' && 'animate-spin')}
      />
      <p className={cn('font-display text-base font-semibold pr-6', accent)}>{title}</p>
      {body && <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</div>}
      {kind === 'research_progress' && typeof progress === 'number' && (
        <div className="mt-3">
          <ProgressBar value={progress} variant="warning" />
        </div>
      )}
      {meta && <p className="mt-2 text-xs text-muted-foreground">{meta}</p>}
      {actions && actions.length > 0 && (
        <div className="mt-3 flex justify-end gap-2">
          {actions.map((action) => (
            <Button key={action.label} size="sm" variant={action.variant ?? 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export { InsightCard };
