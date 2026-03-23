"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  FunnelChart,
  Funnel,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MetricCard,
  ChartWidget,
  ExperimentQuickView,
  DashboardOverview,
} from "@/components/dashboard";
import {
  Users,
  Activity,
  BarChart3,
  TrendingUp,
  DollarSign,
  FlaskConical,
  GitBranch,
  ArrowRight,
  Zap,
  Target,
  Lightbulb,
} from "lucide-react";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

const mockTrendData = [
  {
    week: "S1",
    acquisition: 4200,
    activation: 1890,
    retention: 1200,
    revenue: 45000,
  },
  {
    week: "S2",
    acquisition: 4800,
    activation: 2160,
    retention: 1350,
    revenue: 52000,
  },
  {
    week: "S3",
    acquisition: 3900,
    activation: 1755,
    retention: 1100,
    revenue: 41000,
  },
  {
    week: "S4",
    acquisition: 5200,
    activation: 2340,
    retention: 1480,
    revenue: 58000,
  },
  {
    week: "S5",
    acquisition: 4600,
    activation: 2070,
    retention: 1300,
    revenue: 49000,
  },
  {
    week: "S6",
    acquisition: 5500,
    activation: 2475,
    retention: 1600,
    revenue: 63000,
  },
];

const mockFunnelData = [
  { name: "Visitantes", value: 50000, fill: "#6B4FE8" },
  { name: "Leads", value: 8500, fill: "#8B6FE8" },
  { name: "MQLs", value: 3400, fill: "#A88FE8" },
  { name: "SQLs", value: 1700, fill: "#1AD3C5" },
  { name: "Oportunidades", value: 850, fill: "#10B981" },
  { name: "Clientes", value: 340, fill: "#059669" },
];

const mockChannelData = [
  { name: "Google Ads", value: 45, color: "#6B4FE8" },
  { name: "Meta Ads", value: 35, color: "#1AD3C5" },
  { name: "Orgânico", value: 12, color: "#10B981" },
  { name: "Email", value: 8, color: "#F59E0B" },
];

const mockExperiments = [
  {
    id: "1",
    title: "Novo CTA na landing page",
    status: "in_progress",
    funnelStage: "activation",
    priorityScore: 8.5,
    result: null,
    owner: { name: "Maria Silva" },
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Teste de headline principal",
    status: "in_progress",
    funnelStage: "acquisition",
    priorityScore: 7.2,
    result: null,
    owner: { name: "João Santos" },
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Redesign do checkout",
    status: "completed",
    funnelStage: "revenue",
    priorityScore: 9.1,
    result: "win",
    owner: { name: "Ana Costa" },
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "4",
    title: "Email de onboarding",
    status: "completed",
    funnelStage: "activation",
    priorityScore: 6.8,
    result: "inconclusive",
    owner: { name: "Pedro Lima" },
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
];

const mockMetrics = {
  acquisition: {
    value: 5500,
    trend: 12.5,
    sparkline: [4200, 4800, 3900, 5200, 4600, 5500],
  },
  activation: { value: 45, trend: 8.3, sparkline: [38, 45, 42, 48, 44, 50] },
  retention: { value: 78, trend: -2.1, sparkline: [82, 80, 79, 77, 78, 78] },
  referral: { value: 12, trend: 15.4, sparkline: [8, 10, 9, 11, 12, 14] },
  revenue: {
    value: 63000,
    trend: 18.7,
    sparkline: [45000, 52000, 41000, 58000, 49000, 63000],
  },
};

const mockChannelSummary = {
  totalSpend: 73700,
  totalRevenue: 143000,
  roas: 1.94,
  topChannel: "Google Ads",
};

const mockRecommendations = [
  {
    id: 1,
    title: "Otimizar taxa de conversão do lead para MQL",
    impact: "Alto",
    stage: "Activation",
    description:
      "Gargalo identificado na etapa de qualificação de leads. Testar formulários mais curtos.",
  },
  {
    id: 2,
    title: "Aumentar investimento em canais orgânicos",
    impact: "Médio",
    stage: "Acquisition",
    description:
      "Canais orgânicos apresentam ROAS 3x maior que paid. Priorizar SEO e content.",
  },
];

const mockVelocityStats = {
  experimentsThisWeek: 4,
  winRate: 67,
  avgCycleTime: 12,
};

export default function DashboardView() {
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <DashboardOverview
        metrics={mockMetrics}
        channelSummary={mockChannelSummary}
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
                Últimas 6 semanas
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
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient
                    id="colorAcquisition"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.pulse}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.pulse}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.velocity}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.velocity}
                      stopOpacity={0}
                    />
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
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
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
              experiments={mockExperiments}
              onAddClick={() => {}}
              onViewAll={() => {}}
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
            <div className="space-y-3">
              {mockFunnelData.map((stage, i) => {
                const nextStage = mockFunnelData[i + 1];
                const conversionRate = nextStage
                  ? ((nextStage.value / stage.value) * 100).toFixed(1)
                  : null;
                const maxWidth = (mockFunnelData[0].value / 50000) * 100;

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
                      className="h-8 rounded-md transition-all relative overflow-hidden"
                      style={{
                        background: `${stage.fill}20`,
                        width: `${(stage.value / mockFunnelData[0].value) * 100}%`,
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
            <div className="flex items-center justify-center py-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={mockChannelData} layout="vertical">
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
                    formatter={(value) => [`${value}%`, "Share"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {mockChannelData.map((entry, index) => (
                      <rect key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                    Experimentos
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#F8F7FC", fontFamily: "var(--font-data)" }}
                >
                  {mockVelocityStats.experimentsThisWeek}
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
                    Taxa de Win
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: COLORS.velocity,
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {mockVelocityStats.winRate}%
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
                  {mockVelocityStats.avgCycleTime}d
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
                IA Insights
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRecommendations.map((rec) => (
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
                        rec.impact === "Alto"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color:
                        rec.impact === "Alto" ? COLORS.signal : COLORS.insight,
                    }}
                  >
                    {rec.impact}
                  </Badge>
                </div>
              </div>
            ))}

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
                href="/dashboard/forecast"
                className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors hover:opacity-90"
                style={{
                  background: "rgba(26,24,46,0.4)",
                  border: "1px solid rgba(107,79,232,0.1)",
                }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: "#10B981" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F8F7FC" }}
                >
                  Forecast
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
