'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { MaturityDimension } from '@/lib/agents/types';

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
        <div className="w-16 h-16 rounded-full bg-[var(--surface-strong)] flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-[var(--muted-foreground)] text-sm">
          Complete o diagnóstico para visualizar seu radar de maturidade
        </p>
        <a
          href="/onboarding"
          className="mt-4 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Iniciar diagnóstico
        </a>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{
            fill: 'var(--muted-foreground)',
            fontSize: 11,
            textAnchor: 'middle',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--foreground)',
            fontSize: '12px',
          }}
          formatter={(value) => [`${(value as number).toFixed(1)} / 5.0`, 'Score']}
        />
        <Radar
          name="Maturidade"
          dataKey="score"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: 'var(--primary)', r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
