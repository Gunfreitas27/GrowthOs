import { Target, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { resolveBusinessContext, resolveMaturityScores } from '@/lib/mock/resolver';
import type { MaturityDimension } from '@/lib/agents/types';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

const DIMENSION_LABELS: Record<MaturityDimension, string> = {
  awareness_posicionamento: 'Awareness & Posicionamento',
  aquisicao_paga: 'Aquisição Paga',
  organico_conteudo: 'Orgânico & Conteúdo',
  crm_lifecycle: 'CRM & Lifecycle',
  analytics_atribuicao: 'Analytics & Atribuição',
  diferenciacao_competitiva: 'Diferenciação Competitiva',
  comunidade_movimento: 'Comunidade & Movimento',
};

// Simulated 90-day strategy plan derived from mock maturity scores
const STRATEGY_PLAN = {
  diagnosis: {
    stage: 'Crescimento',
    bottleneck: 'Conversão (baixo closing)',
    genericStrategy: 'Diferenciação',
    unfairAdvantage: 'Base de dados proprietária de benchmarks de growth por segmento',
  },
  sprint1: {
    label: 'Mês 1 — Fundação de Analytics',
    framework: 'Foco: métricas confiáveis',
    actions: [
      'Implementar UTMs em todos os canais ativos',
      'Configurar atribuição multi-touch no Google Analytics 4',
      'Definir North Star Metric operacional (MRR)',
      'Criar dashboard de conversão por etapa do funil',
    ],
  },
  sprint2: {
    label: 'Mês 2 — Aceleração Orgânica',
    framework: 'Foco: conteúdo de fundo de funil',
    actions: [
      'Audit técnico de SEO e corrigir top 10 issues',
      'Publicar 6 artigos de fundo de funil (intento transacional)',
      'Lançar estratégia de link building com parceiros do setor',
      'Criar hub de conteúdo para palavra-chave principal',
    ],
  },
  sprint3: {
    label: 'Mês 3 — Otimização de Conversão',
    framework: 'Foco: otimização de fechamento',
    actions: [
      'Mapear objeções de vendas mais comuns e criar contra-argumentos',
      'Implementar follow-up automatizado em 5 touchpoints',
      'Criar case studies de clientes com ROI mensurável',
      'Testar nova proposta de valor no ads (Grand Slam Offer)',
    ],
  },
  opportunities: [
    { dimension: 'organico_conteudo' as MaturityDimension, score: 2.1, action: 'SEO + Content Hub', roi: 'Alto' },
    { dimension: 'analytics_atribuicao' as MaturityDimension, score: 2.4, action: 'Attribution Model', roi: 'Médio' },
    { dimension: 'awareness_posicionamento' as MaturityDimension, score: 2.8, action: 'Brand Awareness', roi: 'Médio' },
  ],
};

async function getPageData() {
  const workspaceId = await getCurrentWorkspaceId();
  const [bc, scores] = await Promise.all([
    resolveBusinessContext(workspaceId),
    resolveMaturityScores(workspaceId),
  ]);
  return { bc, scores };
}

export default async function StrategyPage() {
  const { bc, scores } = await getPageData();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Estratégia de Growth</h1>
          <p className="text-sm text-muted-foreground">
            Plano de 90 dias gerado pelo advisory-board + hormozi-squad
          </p>
        </div>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-surface-strong text-primary border border-border">
          Gerado por IA
        </span>
      </div>

      {/* Business Diagnosis */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Estágio', value: STRATEGY_PLAN.diagnosis.stage },
          { label: 'Gargalo', value: STRATEGY_PLAN.diagnosis.bottleneck },
          { label: 'Abordagem competitiva', value: STRATEGY_PLAN.diagnosis.genericStrategy },
          { label: 'Budget', value: (bc as Record<string, unknown>).budget as string ?? 'R$20–100k' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-card shadow-elevated p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Unfair Advantage */}
      <div className="rounded-xl bg-primary/5 shadow-elevated p-5 mb-6 flex items-start gap-3">
        <Lightbulb size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Unfair Advantage</p>
          <p className="text-sm">{STRATEGY_PLAN.diagnosis.unfairAdvantage}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Identificado a partir do seu diagnóstico competitivo
          </p>
        </div>
      </div>

      {/* 90-Day Plan */}
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Plano de 90 Dias
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[STRATEGY_PLAN.sprint1, STRATEGY_PLAN.sprint2, STRATEGY_PLAN.sprint3].map((sprint, i) => (
          <div key={i} className="rounded-xl bg-card shadow-elevated p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm font-semibold">{sprint.label}</p>
            </div>
            <p className="text-xs text-primary mb-3">{sprint.framework}</p>
            <ul className="space-y-2">
              {sprint.actions.map((action, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight size={12} className="mt-0.5 shrink-0 text-primary" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Opportunities from Gaps */}
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Oportunidades Priorizadas por Impacto
      </h2>
      <div className="rounded-xl bg-card shadow-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Dimensão</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Score atual</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Ação recomendada</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">ROI esperado</th>
            </tr>
          </thead>
          <tbody>
            {STRATEGY_PLAN.opportunities.map((opp, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{DIMENSION_LABELS[opp.dimension]}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-surface-strong">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${(opp.score / 5) * 100}%` }} />
                    </div>
                    <span className="text-muted-foreground">{opp.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{opp.action}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    opp.roi === 'Alto'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {opp.roi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Estratégia gerada a partir do seu diagnóstico de maturidade
      </p>
    </div>
  );
}
