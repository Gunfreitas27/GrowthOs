import type { MaturityDimension } from '@/lib/agents/types';
import { TrendingDown, TrendingUp } from 'lucide-react';

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

function Row({ dim, detail, color }: { dim: MaturityDimension; detail: ScoreDetail; color: 'red' | 'green' }) {
  return (
    <div className={color === 'red' ? 'border-l-2 border-red-400 pl-3' : 'border-l-2 border-green-400 pl-3'}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[var(--foreground)]">{LABELS[dim]}</span>
        <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
          {detail.score.toFixed(1)}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] mb-2">
        <div
          className={color === 'red' ? 'h-full rounded-full bg-red-500 transition-all duration-700' : 'h-full rounded-full bg-green-500 transition-all duration-700'}
          style={{ width: `${(detail.score / 5) * 100}%` }}
        />
      </div>
      {detail.rationale && (
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{detail.rationale}</p>
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
        <h3 className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-4 flex items-center gap-1.5">
          <TrendingDown size={12} className="text-red-400" />
          Gaps Prioritários
        </h3>
        <div className="space-y-4">
          {gaps.map(([dim, detail]) => (
            <Row key={dim} dim={dim} detail={detail} color="red" />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-4 flex items-center gap-1.5">
          <TrendingUp size={12} className="text-green-400" />
          Maiores Forças
        </h3>
        <div className="space-y-4">
          {opportunities.map(([dim, detail]) => (
            <Row key={dim} dim={dim} detail={detail} color="green" />
          ))}
        </div>
      </div>
    </div>
  );
}
