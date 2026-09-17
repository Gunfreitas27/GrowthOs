import MaturityRadar from '@/components/overview/MaturityRadar';
import MaturityGapList from '@/components/overview/MaturityGapList';
import { ExecutiveSummaryHero } from '@/components/overview/ExecutiveSummaryHero';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import {
  resolveMaturityScores,
  resolveMaturityScoresDetailed,
  resolveVisibleModules,
  resolveBusinessContext,
} from '@/lib/mock/resolver';
import type { MaturityDimension } from '@/lib/agents/types';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';

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
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Growth Maturity Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Diagnóstico de maturidade em {showCommunity ? 7 : 6} dimensões de crescimento
        </p>
      </div>

      {/* What to do now — the answer to "o que fazer depois do diagnóstico":
          generated once by the advisory board right when scoring finishes
          (lib/agents/generate-executive-summary.ts), not something the user
          has to go ask for in chat. Treated as the centerpiece of the page,
          not a tinted callout box. */}
      {executiveSummary && <ExecutiveSummaryHero summary={executiveSummary} />}

      {/* Radar + Score */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2 p-6">
          <MaturityRadar scores={typedScores} showCommunity={showCommunity} />
        </Card>

        <div className="flex flex-col gap-4">
          {/* Overall Score — hero treatment: biggest number on the page,
              the one figure most worth a glance from the dashboard. */}
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            {avgScore !== null ? (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Score Geral
                </p>
                <p className="font-display text-5xl font-semibold text-primary">
                  {avgScore.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">de 5.0</p>
                <div className="w-full mt-4">
                  <ProgressBar value={avgScore} max={5} />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Score Geral
                </p>
                <p className="font-display text-4xl font-semibold text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Complete o diagnóstico
                </p>
              </>
            )}
          </Card>

          {/* Unlocked modules — a dot row instead of a second giant number,
              so it doesn't read as a triplet clone of the score tile. */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Módulos ativos
              </p>
              <span className="font-display text-lg font-semibold text-foreground">
                {unlockedModules.length}
                <span className="text-muted-foreground text-xs font-body">/10</span>
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full',
                    i < unlockedModules.length ? 'bg-primary' : 'bg-surface-strong'
                  )}
                />
              ))}
            </div>
          </Card>

          {/* Market sizing — estimated by AI, never asked in onboarding
              (see lib/business-context/estimate-market-sizing.ts) */}
          {(tamSamSom || northStar) && (
            <Card className="p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Mercado (estimativa da IA)
              </p>
              {tamSamSom && <p className="text-sm text-foreground">{tamSamSom}</p>}
              {northStar && (
                <p className="text-xs text-muted-foreground mt-2">
                  Métrica-guia sugerida: <span className="text-foreground">{northStar}</span>
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Gaps & Strengths */}
      {hasDiagnostic && (
        <Card className="p-6">
          <h2 className="font-display text-sm font-semibold mb-4 text-foreground">
            Análise de Dimensões
          </h2>
          <MaturityGapList scores={detailedScores} />
        </Card>
      )}

      {/* CTA when no data — MaturityRadar's own empty state already offers
          "Iniciar diagnóstico"; a second identical CTA below it was just
          noise on an otherwise-empty page. */}
    </div>
  );
}
