import type { MaturityDimension } from '@/lib/agents/types';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

const LABELS: Record<MaturityDimension, string> = {
  awareness_posicionamento: 'Awareness & Posicionamento',
  aquisicao_paga: 'Aquisição Paga',
  organico_conteudo: 'Orgânico & Conteúdo',
  crm_lifecycle: 'CRM & Lifecycle',
  analytics_atribuicao: 'Analytics & Atribuição',
  diferenciacao_competitiva: 'Diferenciação Competitiva',
  comunidade_movimento: 'Comunidade & Movimento',
};

export interface ScoreDetail {
  score: number;
  rationale: string | null;
}

interface MaturityGapListProps {
  scores: Partial<Record<MaturityDimension, ScoreDetail>>;
}

function Row({ dim, detail, tone }: { dim: MaturityDimension; detail: ScoreDetail; tone: 'danger' | 'success' }) {
  return (
    <div className={cn('border-l-2 pl-3', tone === 'danger' ? 'border-danger' : 'border-success')}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{LABELS[dim]}</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {detail.score.toFixed(1)}
        </span>
      </div>
      <div className="mb-2">
        <ProgressBar value={detail.score} max={5} variant={tone} />
      </div>
      {detail.rationale && (
        <p className="text-xs text-muted-foreground leading-relaxed">{detail.rationale}</p>
      )}
    </div>
  );
}

export default function MaturityGapList({ scores }: MaturityGapListProps) {
  const entries = Object.entries(scores) as [MaturityDimension, ScoreDetail][];
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(([, a], [, b]) => a.score - b.score);
  const gaps = sorted.slice(0, 3);
  const opportunities = sorted.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <TrendingDown size={12} className="text-danger" />
          Gaps Prioritários
        </h3>
        <div className="space-y-4">
          {gaps.map(([dim, detail]) => (
            <Row key={dim} dim={dim} detail={detail} tone="danger" />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <TrendingUp size={12} className="text-success" />
          Maiores Forças
        </h3>
        <div className="space-y-4">
          {opportunities.map(([dim, detail]) => (
            <Row key={dim} dim={dim} detail={detail} tone="success" />
          ))}
        </div>
      </div>
    </div>
  );
}
