import MaturityRadar from '@/components/overview/MaturityRadar';
import MaturityGapList from '@/components/overview/MaturityGapList';
import {
  resolveMaturityScores,
  resolveMaturityScoresDetailed,
  resolveVisibleModules,
  resolveBusinessContext,
} from '@/lib/mock/resolver';
import type { MaturityDimension } from '@/lib/agents/types';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { Sparkles } from 'lucide-react';

async function getPageData() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    const [scores, detailedScores, unlockedModules, businessContext] = await Promise.all([
      resolveMaturityScores(workspaceId),
      resolveMaturityScoresDetailed(workspaceId),
      resolveVisibleModules(workspaceId),
      resolveBusinessContext(workspaceId),
    ]);
    return { scores, detailedScores, unlockedModules, businessContext };
  } catch {
    return { scores: {}, detailedScores: {}, unlockedModules: [], businessContext: {} as Record<string, unknown> };
  }
}

export default async function OverviewPage() {
  const { scores, detailedScores, unlockedModules, businessContext } = await getPageData();

  const typedScores = scores as Partial<Record<MaturityDimension, number>>;
  const showCommunity = unlockedModules.some((m) => m.moduleKey === 'community');
  const avgScore =
    Object.values(typedScores).length > 0
      ? Object.values(typedScores).reduce((a, b) => a + (b ?? 0), 0) /
        Object.values(typedScores).length
      : null;

  const bc = businessContext as Record<string, unknown>;
  const executiveSummary = bc.executive_summary as string | undefined;
  const tamSamSom = bc.tam_sam_som as string | undefined;
  const northStar = bc.north_star_metric as string | undefined;
  const hasDiagnostic = Object.keys(typedScores).length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Growth Maturity Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Diagnóstico de maturidade em {showCommunity ? 7 : 6} dimensões de crescimento
        </p>
      </div>

      {/* What to do now — the answer to "o que fazer depois do diagnóstico":
          generated once by the advisory board right when scoring finishes
          (lib/agents/generate-executive-summary.ts), not something the user
          has to go ask for in chat. */}
      {executiveSummary && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-primary" />
            <h2 className="text-sm font-semibold">O que fazer agora</h2>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{executiveSummary}</p>
        </div>
      )}

      {/* Radar + Score */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <MaturityRadar scores={typedScores} showCommunity={showCommunity} />
        </div>

        <div className="flex flex-col gap-4">
          {/* Overall Score */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center">
            {avgScore !== null ? (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Score Geral
                </p>
                <p className="text-5xl font-bold text-primary">
                  {avgScore.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">de 5.0</p>
                <div className="w-full mt-4 h-2 rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${(avgScore / 5) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Score Geral
                </p>
                <p className="text-4xl font-bold text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Complete o diagnóstico
                </p>
              </>
            )}
          </div>

          {/* Unlocked modules count */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Módulos ativos
            </p>
            <p className="text-3xl font-bold">{unlockedModules.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              de 10 disponíveis
            </p>
          </div>

          {/* Market sizing — estimated by AI, never asked in onboarding
              (see lib/business-context/estimate-market-sizing.ts) */}
          {(tamSamSom || northStar) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Mercado (estimativa da IA)
              </p>
              {tamSamSom && <p className="text-sm text-foreground">{tamSamSom}</p>}
              {northStar && (
                <p className="text-xs text-muted-foreground mt-2">
                  Métrica-guia sugerida: <span className="text-foreground">{northStar}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gaps & Strengths */}
      {hasDiagnostic && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Análise de Dimensões</h2>
          <MaturityGapList scores={detailedScores} />
        </div>
      )}

      {/* CTA when no data — MaturityRadar's own empty state already offers
          "Iniciar diagnóstico"; a second identical CTA below it was just
          noise on an otherwise-empty page. */}
    </div>
  );
}
