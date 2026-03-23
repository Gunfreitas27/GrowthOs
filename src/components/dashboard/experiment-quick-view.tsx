"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  ChevronRight,
  Plus,
  Filter,
} from "lucide-react";

interface ExperimentQuickViewProps {
  experiments: {
    id: string;
    title: string;
    status: string;
    funnelStage: string;
    priorityScore: number | null;
    result: string | null;
    owner: { name: string | null } | null;
    createdAt: string | Date;
  }[];
  onAddClick?: () => void;
  onViewAll?: () => void;
}

const STATUS_CONFIG = {
  idea: {
    label: "Ideia",
    color: "var(--velox-mist)",
    bg: "rgba(168,163,199,0.15)",
  },
  backlog: {
    label: "Backlog",
    color: "var(--velox-pulse)",
    bg: "rgba(107,79,232,0.15)",
  },
  in_progress: {
    label: "Em Execução",
    color: "var(--velox-insight)",
    bg: "rgba(245,158,11,0.15)",
  },
  paused: {
    label: "Pausado",
    color: "var(--velox-insight)",
    bg: "rgba(245,158,11,0.15)",
  },
  completed: {
    label: "Concluído",
    color: "var(--velox-velocity)",
    bg: "rgba(26,211,197,0.15)",
  },
  archived: {
    label: "Arquivado",
    color: "var(--velox-mist)",
    bg: "rgba(168,163,199,0.1)",
  },
};

const RESULT_CONFIG = {
  win: { label: "Win", color: "var(--velox-velocity)", icon: "🏆" },
  loss: { label: "Loss", color: "var(--velox-signal)", icon: "📉" },
  inconclusive: {
    label: "Inconclusivo",
    color: "var(--velox-mist)",
    icon: "➖",
  },
};

const STAGE_LABELS: Record<string, string> = {
  awareness: "Reconhecimento",
  acquisition: "Aquisição",
  activation: "Ativação",
  retention: "Retenção",
  revenue: "Receita",
  referral: "Indicação",
};

export function ExperimentQuickView({
  experiments,
  onAddClick,
  onViewAll,
}: ExperimentQuickViewProps) {
  const runningExperiments = experiments.filter(
    (e) => e.status === "in_progress",
  );
  const recentCompleted = experiments
    .filter((e) => e.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "14px",
              color: "#F8F7FC",
            }}
          >
            Experimentos
          </h3>
          <p className="text-xs" style={{ color: "var(--velox-mist)" }}>
            {runningExperiments.length} em execução
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Filter className="w-3 h-3 mr-1" />
            Filtrar
          </Button>
          <Button size="sm" className="h-8" onClick={onAddClick}>
            <Plus className="w-3 h-3 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      {/* Running Experiments */}
      {runningExperiments.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--velox-mist)" }}
          >
            Em Execução
          </p>
          {runningExperiments.slice(0, 3).map((exp) => (
            <div
              key={exp.id}
              className="p-3 rounded-lg transition-colors cursor-pointer hover:opacity-90"
              style={{
                background: "rgba(26,24,46,0.4)",
                border: "1px solid rgba(107,79,232,0.1)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate mb-1"
                    style={{ color: "#F8F7FC" }}
                  >
                    {exp.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        borderColor: "rgba(107,79,232,0.3)",
                        color: "var(--velox-mist)",
                      }}
                    >
                      {STAGE_LABELS[exp.funnelStage] || exp.funnelStage}
                    </Badge>
                    {exp.owner && (
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: "var(--velox-mist)" }}
                      >
                        <User className="w-3 h-3" />
                        {exp.owner.name?.split(" ")[0] || "—"}
                      </span>
                    )}
                  </div>
                </div>
                {exp.priorityScore && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(107,79,232,0.15)",
                      color: "var(--velox-pulse)",
                      fontFamily: "var(--font-data)",
                    }}
                  >
                    {exp.priorityScore.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Wins */}
      {recentCompleted.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--velox-mist)" }}
          >
            Recentes
          </p>
          {recentCompleted.map((exp) => {
            const resultConfig = exp.result
              ? RESULT_CONFIG[exp.result as keyof typeof RESULT_CONFIG]
              : null;

            return (
              <div
                key={exp.id}
                className="p-3 rounded-lg transition-colors cursor-pointer hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {resultConfig && (
                      <span className="text-sm">{resultConfig.icon}</span>
                    )}
                    <span
                      className="text-sm truncate"
                      style={{ color: "#F8F7FC" }}
                    >
                      {exp.title}
                    </span>
                  </div>
                  {exp.result && resultConfig && (
                    <Badge
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        background: `${resultConfig.color}20`,
                        color: resultConfig.color,
                      }}
                    >
                      {resultConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {onViewAll && (
        <Button
          variant="ghost"
          className="w-full justify-between h-10"
          onClick={onViewAll}
          style={{ color: "var(--velox-pulse)" }}
        >
          Ver todos os experimentos
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Empty State */}
      {experiments.length === 0 && (
        <div className="text-center py-8">
          <FlaskConical
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "var(--velox-mist)", opacity: 0.5 }}
          />
          <p className="text-sm" style={{ color: "var(--velox-mist)" }}>
            Nenhum experimento ainda
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--velox-mist)", opacity: 0.7 }}
          >
            Crie sua primeira hipótese
          </p>
        </div>
      )}
    </div>
  );
}
