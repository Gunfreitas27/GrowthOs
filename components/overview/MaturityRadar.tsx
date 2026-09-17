'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Radar as RadarIcon } from 'lucide-react';
import type { MaturityDimension } from '@/lib/agents/types';
import { Button } from '@/components/ui/button';

const DIMENSION_LABELS: Record<MaturityDimension, string> = {
  awareness_posicionamento: 'Awareness &\nPosicionamento',
  aquisicao_paga: 'Aquisição\nPaga',
  organico_conteudo: 'Orgânico &\nConteúdo',
  crm_lifecycle: 'CRM &\nLifecycle',
  analytics_atribuicao: 'Analytics &\nAtribuição',
  diferenciacao_competitiva: 'Diferenciação\nCompetitiva',
  comunidade_movimento: 'Comunidade &\nMovimento',
};

const CORE_DIMENSIONS: MaturityDimension[] = [
  'awareness_posicionamento',
  'aquisicao_paga',
  'organico_conteudo',
  'crm_lifecycle',
  'analytics_atribuicao',
  'diferenciacao_competitiva',
];

interface MaturityRadarProps {
  scores: Partial<Record<MaturityDimension, number>>;
  showCommunity?: boolean;
}

export default function MaturityRadar({ scores, showCommunity = false }: MaturityRadarProps) {
  const dimensions = showCommunity
    ? [...CORE_DIMENSIONS, 'comunidade_movimento' as MaturityDimension]
    : CORE_DIMENSIONS;

  const data = dimensions.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    score: scores[dim] ?? 0,
    fullMark: 5,
  }));

  const hasData = Object.values(scores).some((s) => s !== undefined && s > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[360px] text-center">
        <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center mb-4">
          <RadarIcon size={26} className="text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Complete o diagnóstico para visualizar seu radar de maturidade
        </p>
        <Button asChild className="mt-4">
          <a href="/onboarding">Iniciar diagnóstico</a>
        </Button>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{
            fill: 'var(--color-muted-foreground)',
            fontSize: 11,
            textAnchor: 'middle',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-foreground)',
            fontSize: '12px',
          }}
          formatter={(value) => [`${(value as number).toFixed(1)} / 5.0`, 'Score']}
        />
        <Radar
          name="Maturidade"
          dataKey="score"
          stroke="var(--color-primary)"
          fill="var(--color-primary)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: 'var(--color-primary)', r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
