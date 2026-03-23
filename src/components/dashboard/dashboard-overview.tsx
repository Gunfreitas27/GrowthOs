"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { MetricCard } from "./metric-card";
import { DateRangePicker } from "./date-range-picker";
import { useState } from "react";

interface AarrrMetrics {
  acquisition: { value: number; trend: number; sparkline: number[] };
  activation: { value: number; trend: number; sparkline: number[] };
  retention: { value: number; trend: number; sparkline: number[] };
  referral: { value: number; trend: number; sparkline: number[] };
  revenue: { value: number; trend: number; sparkline: number[] };
}

interface DashboardOverviewProps {
  metrics: AarrrMetrics;
  channelSummary?: {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    topChannel: string;
  };
}

const STAGE_CONFIG = {
  acquisition: {
    label: "Aquisição",
    icon: Users,
    color: "#6B4FE8",
    description: "Visitantes e leads",
  },
  activation: {
    label: "Ativação",
    icon: Activity,
    color: "#1AD3C5",
    description: "Usuários ativados",
  },
  retention: {
    label: "Retenção",
    icon: BarChart3,
    color: "#F59E0B",
    description: "Taxa de retenção",
  },
  referral: {
    label: "Indicação",
    icon: TrendingUp,
    color: "#EC4899",
    description: "Net Promoter Score",
  },
  revenue: {
    label: "Receita",
    icon: DollarSign,
    color: "#10B981",
    description: "MRR e ARPU",
  },
};

export function DashboardOverview({
  metrics,
  channelSummary,
}: DashboardOverviewProps) {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "18px",
              color: "#F8F7FC",
            }}
          >
            Visão Geral AARRR
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--velox-mist)" }}>
            Acompanhe o funil completo de crescimento
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(metrics).map(([key, data]) => {
          const config = STAGE_CONFIG[key as keyof typeof STAGE_CONFIG];
          const Icon = config.icon;

          return (
            <MetricCard
              key={key}
              title={config.label}
              value={data.value}
              trend={data.trend}
              trendLabel="vs período anterior"
              accentColor={config.color}
              sparklineData={data.sparkline}
              format={
                key === "revenue"
                  ? "currency"
                  : key === "retention" || key === "referral"
                    ? "percent"
                    : "number"
              }
              icon={
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              }
            />
          );
        })}
      </div>

      {/* Channel Summary (se disponível) */}
      {channelSummary && (
        <Card
          style={{
            background: "rgba(26,24,46,0.4)",
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
              Resumo de Canais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{ color: "var(--velox-mist)" }}
                >
                  Investimento Total
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "#F8F7FC", fontFamily: "var(--font-data)" }}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(channelSummary.totalSpend)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{ color: "var(--velox-mist)" }}
                >
                  Receita
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "#F8F7FC", fontFamily: "var(--font-data)" }}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(channelSummary.totalRevenue)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{ color: "var(--velox-mist)" }}
                >
                  ROAS
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color:
                      channelSummary.roas >= 2
                        ? "var(--velox-velocity)"
                        : "var(--velox-insight)",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {channelSummary.roas.toFixed(2)}x
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{ color: "var(--velox-mist)" }}
                >
                  Canal Principal
                </p>
                <p className="text-lg font-bold" style={{ color: "#F8F7FC" }}>
                  {channelSummary.topChannel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
