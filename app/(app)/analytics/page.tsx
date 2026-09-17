import { BarChart2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { resolveMaturityScores } from '@/lib/mock/resolver';
import type { MaturityDimension } from '@/lib/agents/types';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

// Mock analytics metrics (data-squad: Kaushik + Peter Fader + Sean Ellis)
const MOCK_METRICS = {
  north_star: { label: 'MRR', value: 'R$ 84.200', change: '+12%', trend: 'up' },
  cac: { label: 'CAC Médio', value: 'R$ 820', change: '-5%', trend: 'down-good' },
  ltv: { label: 'LTV Médio', value: 'R$ 3.680', change: '+8%', trend: 'up' },
  ltv_cac: { label: 'LTV:CAC', value: '4.5x', change: '+0.3x', trend: 'up' },
  churn: { label: 'Churn Mensal', value: '3.2%', change: '+0.4%', trend: 'down-bad' },
  nrr: { label: 'NRR (Net Revenue Retention)', value: '108%', change: '+3pp', trend: 'up' },
};

const MOCK_CHANNELS = [
  { name: 'Google Ads', sessions: 4820, conversions: 38, cac: 'R$ 680', contribution: 42 },
  { name: 'SEO Orgânico', sessions: 3210, conversions: 21, cac: 'R$ 290', contribution: 28 },
  { name: 'Content Marketing', sessions: 1890, conversions: 12, cac: 'R$ 410', contribution: 16 },
  { name: 'Parcerias', sessions: 940, conversions: 8, cac: 'R$ 520', contribution: 14 },
];

const MOCK_FUNNEL = [
  { stage: 'Visitantes', value: 10860, pct: 100 },
  { stage: 'Leads', value: 1240, pct: 11.4 },
  { stage: 'MQL', value: 380, pct: 3.5 },
  { stage: 'SQL', value: 142, pct: 1.3 },
  { stage: 'Clientes', value: 79, pct: 0.73 },
];

const MOCK_INSIGHTS = [
  {
    type: 'gap' as const,
    title: 'Tracking incompleto',
    body: 'Apenas 68% das sessões têm UTM source. Atribuição de 32% das conversões está missing.',
    dimension: 'analytics_atribuicao' as MaturityDimension,
  },
  {
    type: 'opportunity' as const,
    title: 'CAC de SEO 2.3× mais barato',
    body: 'Orgânico gera CAC de R$290 vs R$680 em Ads. Aumentar budget em content pode reduzir CAC médio em 18%.',
    dimension: 'organico_conteudo' as MaturityDimension,
  },
  {
    type: 'gap' as const,
    title: 'Churn acelerando levemente',
    body: 'Churn subiu 0.4pp no mês. Identificar cohort de risco via análise de NPS × usage frequency.',
    dimension: 'crm_lifecycle' as MaturityDimension,
  },
];

export default async function AnalyticsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const scores = await resolveMaturityScores(workspaceId);
  const analyticsScore = scores.analytics_atribuicao ?? 2.4;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-surface-strong flex items-center justify-center">
          <BarChart2 size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Analytics & Atribuição</h1>
          <p className="text-sm text-muted-foreground">
            Analisado por data-squad (Kaushik + Peter Fader + Sean Ellis)
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Score de maturidade</span>
          <span className="text-sm font-bold text-amber-600">{analyticsScore.toFixed(1)}/5.0</span>
        </div>
      </div>

      {/* North Star + KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* North Star destacado */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">
            North Star Metric
          </p>
          <p className="text-3xl font-bold">{MOCK_METRICS.north_star.value}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-xs text-green-600">{MOCK_METRICS.north_star.change} MoM</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{MOCK_METRICS.north_star.label}</p>
        </div>

        {/* Other KPIs */}
        <div className="col-span-2 grid grid-cols-3 gap-3">
          {[MOCK_METRICS.ltv_cac, MOCK_METRICS.churn, MOCK_METRICS.nrr,
            MOCK_METRICS.cac, MOCK_METRICS.ltv].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-xl font-bold">{m.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {m.trend === 'up' ? (
                  <TrendingUp size={10} className="text-green-600" />
                ) : m.trend === 'down-good' ? (
                  <TrendingDown size={10} className="text-green-600" />
                ) : m.trend === 'down-bad' ? (
                  <TrendingDown size={10} className="text-red-600" />
                ) : (
                  <Minus size={10} className="text-muted-foreground" />
                )}
                <span className={`text-xs ${
                  m.trend === 'up' || m.trend === 'down-good' ? 'text-green-600' :
                  m.trend === 'down-bad' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {m.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel + Channels */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Funil de Conversão (30d)
          </h2>
          <div className="space-y-2">
            {MOCK_FUNNEL.map((stage, i) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.value.toLocaleString('pt-BR')} ({stage.pct}%)
                  </span>
                </div>
                <div className="h-6 rounded-md bg-surface-strong relative overflow-hidden">
                  <div
                    className="h-full rounded-md bg-primary transition-all duration-700"
                    style={{ width: `${stage.pct}%`, opacity: 1 - i * 0.12 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Attribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Atribuição por Canal
          </h2>
          <div className="space-y-3">
            {MOCK_CHANNELS.map((ch) => (
              <div key={ch.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{ch.name}</span>
                  <span className="text-muted-foreground">{ch.conversions} conv · CAC {ch.cac}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${ch.contribution}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">
            Modelo See-Think-Do-Care (Avinash Kaushik) — data-squad.skill
          </p>
        </div>
      </div>

      {/* AI Insights */}
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Insights do data-squad
      </h2>
      <div className="space-y-3">
        {MOCK_INSIGHTS.map((insight, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              insight.type === 'gap'
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            {insight.type === 'gap' ? (
              <AlertCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
            ) : (
              <TrendingUp size={15} className="text-green-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${insight.type === 'gap' ? 'text-red-700' : 'text-green-700'}`}>
                {insight.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{insight.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Análise gerada por <strong>data-squad.skill</strong> — Avinash Kaushik (See-Think-Do-Care) · Peter Fader (CLV) · Sean Ellis (Growth Metrics) · Nick Mehta (NRR)
      </p>
    </div>
  );
}
