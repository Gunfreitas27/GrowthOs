"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DashboardOverview,
  ExperimentQuickView,
} from "@/components/dashboard";
import {
  FlaskConical,
  GitBranch,
  ArrowRight,
  Zap,
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { DashboardData } from "./actions";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

interface DashboardViewProps {
  data: DashboardData;
}

export default function DashboardView({ data }: DashboardViewProps) {
  return (
    <div className="space-y-8">
      <DashboardOverview
        metrics={data.metrics}
        channelSummary={data.channelSummary}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Chart */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
            gridColumn: "span 2",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#F8F7FC",
                }}
              >
                Tendência de Crescimento
              </CardTitle>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--velox-mist)" }}
              >
                Últimas semanas
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS.pulse }}
                />
                <span className="text-xs" style={{ color: COLORS.mist }}>
                  Aquisição
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS.velocity }}
                />
                <span className="text-xs" style={{ color: COLORS.mist }}>
                  Receita
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {data.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.trendData}>
                  <defs>
                    <linearGradient
                      id="colorAcquisition"
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop offset="5%" stopColor={COLORS.pulse} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.pulse} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.velocity} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.velocity} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="week"
                    stroke={COLORS.mist}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={COLORS.mist}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A182E",
                      border: "1px solid rgba(107,79,232,0.25)",
                      borderRadius: "8px",
                      fontFamily: "var(--font-ui)",
                      fontSize: "12px",
                      color: "#F8F7FC",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="acquisition"
                    stroke={COLORS.pulse}
                    fillOpacity={1}
                    fill="url(#colorAcquisition)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.velocity}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ height: 280, color: COLORS.mist }}
              >
                Nenhum dado de tendência disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experiments Quick View */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-5">
            <ExperimentQuickView
              experiments={data.recentExperiments}
              onAddClick={() => window.location.href = "/dashboard/experiments"}
              onViewAll={() => window.location.href = "/dashboard/experiments"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Channels Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversion Funnel */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Funil de Conversão
            </CardTitle>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--velox-mist)" }}
            >
              Taxa de conversão entre etapas
            </p>
          </CardHeader>
          <CardContent>
            {data.funnelData.length > 0 ? (
              <div className="space-y-3">
                {data.funnelData.map((stage, i) => {
                  const nextStage = data.funnelData[i + 1];
                  const conversionRate = nextStage && stage.value > 0
                    ? ((nextStage.value / stage.value) * 100).toFixed(1)
                    : null;
                  const maxVal = data.funnelData[0].value;

                  return (
                    <div key={stage.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#F8F7FC" }}
                        >
                          {stage.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-bold"
                            style={{
                              color: "#F8F7FC",
                              fontFamily: "var(--font-data)",
                            }}
                          >
                            {stage.value.toLocaleString("pt-BR")}
                          </span>
                          {conversionRate && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(107,79,232,0.15)",
                                color: "var(--velox-pulse)",
                                fontFamily: "var(--font-data)",
                              }}
                            >
                              {conversionRate}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="h-8 rounded-md relative overflow-hidden"
                        style={{
                          background: `${stage.fill}20`,
                          width: `${(stage.value / maxVal) * 100}%`,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-md"
                          style={{ background: stage.fill, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="py-8 text-center"
                style={{ color: COLORS.mist }}
              >
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Conecte métricas para ver o funil</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Distribuição de Canais
            </CardTitle>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--velox-mist)" }}
            >
              % do investimento por canal
            </p>
          </CardHeader>
          <CardContent>
            {data.channelSummary.channelDistribution.length > 0 ? (
              <div className="flex items-center justify-center py-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={data.channelSummary.channelDistribution}
                    layout="vertical"
                  >
                    <XAxis
                      type="number"
                      stroke={COLORS.mist}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke={COLORS.mist}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1A182E",
                        border: "1px solid rgba(107,79,232,0.25)",
                        borderRadius: "8px",
                        fontFamily: "var(--font-ui)",
                        fontSize: "12px",
                        color: "#F8F7FC",
                      }}
                      formatter={(value) => [`${value || 0}%`, "Share"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.channelSummary.channelDistribution.map((entry) => (
                        <rect key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className="py-8 text-center"
                style={{ color: COLORS.mist }}
              >
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  <Link
                    href="/dashboard/channels"
                    style={{ color: COLORS.pulse }}
                  >
                    Conecte canais
                  </Link>{" "}
                  para ver distribuição
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Velocity Stats */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Velocidade do Time
            </CardTitle>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--velox-mist)" }}
            >
              Performance da semana
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(26,24,46,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(107,79,232,0.15)" }}
                  >
                    <FlaskConical
                      className="w-4 h-4"
                      style={{ color: COLORS.pulse }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: "#F8F7FC" }}>
                    Em Execução
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#F8F7FC", fontFamily: "var(--font-data)" }}
                >
                  {data.velocityStats.runningNow}
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(26,24,46,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(26,211,197,0.15)" }}
                  >
                    <Target
                      className="w-4 h-4"
                      style={{ color: COLORS.velocity }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: "#F8F7FC" }}>
                    Win Rate
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: COLORS.velocity,
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {data.velocityStats.winRate}%
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(26,24,46,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(245,158,11,0.15)" }}
                  >
                    <Zap
                      className="w-4 h-4"
                      style={{ color: COLORS.insight }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: "#F8F7FC" }}>
                    Ciclo Médio
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: COLORS.insight,
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {data.velocityStats.avgCycleTime}d
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(26,24,46,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(107,79,232,0.15)" }}
                  >
                    <Activity
                      className="w-4 h-4"
                      style={{ color: COLORS.pulse }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: "#F8F7FC" }}>
                    Learnings
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: COLORS.pulse,
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {data.velocityStats.totalLearnings}
                </span>
              </div>
            </div>

            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(107,79,232,0.1)" }}
            >
              <Link
                href="/dashboard/velocity"
                className="flex items-center justify-between text-sm group"
                style={{ color: "var(--velox-pulse)" }}
              >
                Ver detalhes de velocidade
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Recommendations */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.15)" }}
                >
                  <Lightbulb
                    className="w-4 h-4"
                    style={{ color: COLORS.insight }}
                  />
                </div>
                <CardTitle
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#F8F7FC",
                  }}
                >
                  Recomendações
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{
                  borderColor: "rgba(107,79,232,0.3)",
                  color: "var(--velox-mist)",
                }}
              >
                Diagnóstico Automático
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.length > 0 ? (
              data.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    background: "rgba(26,24,46,0.4)",
                    border: "1px solid rgba(107,79,232,0.1)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "#F8F7FC" }}
                      >
                        {rec.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--velox-mist)" }}
                      >
                        {rec.description}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 text-[10px]"
                      style={{
                        background:
                          rec.impact === "Alto" || rec.impact === "Crítico"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          rec.impact === "Alto" || rec.impact === "Crítico"
                            ? COLORS.signal
                            : COLORS.insight,
                      }}
                    >
                      {rec.impact}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="py-8 text-center"
                style={{ color: COLORS.mist }}
              >
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Conecte mais dados para receber recomendações automáticas
                </p>
              </div>
            )}

            <Link
              href="/dashboard/diagnosis"
              className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm transition-colors hover:opacity-80"
              style={{
                background: "rgba(107,79,232,0.1)",
                color: "var(--velox-pulse)",
              }}
            >
              Ver diagnóstico completo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.12)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/experiments"
                className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <FlaskConical
                  className="w-6 h-6"
                  style={{ color: COLORS.pulse }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F8F7FC" }}
                >
                  Novo Experimento
                </span>
              </Link>

              <Link
                href="/dashboard/funnels"
                className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <GitBranch
                  className="w-6 h-6"
                  style={{ color: COLORS.velocity }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F8F7FC" }}
                >
                  Atualizar Funil
                </span>
              </Link>

              <Link
                href="/dashboard/channels"
                className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <BarChart3
                  className="w-6 h-6"
                  style={{ color: COLORS.insight }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F8F7FC" }}
                >
                  Ver Canais
                </span>
              </Link>

              <Link
                href="/dashboard/utm"
                className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: "#10B981" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F8F7FC" }}
                >
                  Criar UTM
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
