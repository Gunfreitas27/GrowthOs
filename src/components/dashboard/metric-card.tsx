"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: "number" | "currency" | "percent" | "duration";
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  sparklineData?: number[];
}

function formatValue(value: number | string, format: string): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration":
      return `${value}d`;
    default:
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString("pt-BR");
  }
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  accentColor = "var(--velox-pulse)",
  sparklineData,
  format = "number",
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const isNeutral = trend === undefined || trend === 0;

  const trendColor = isNeutral
    ? "var(--velox-mist)"
    : isPositive
      ? "var(--velox-velocity)"
      : "var(--velox-signal)";

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <Card
      className="relative overflow-hidden"
      style={{
        background: "rgba(26,24,46,0.6)",
        border: "1px solid rgba(107,79,232,0.12)",
        borderRadius: "12px",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: accentColor }}
      />

      <CardContent className="pt-5 pb-4 px-4 pl-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p
              className="text-xs font-medium tracking-wide uppercase mb-1"
              style={{
                color: "var(--velox-mist)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {title}
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                color: "#F8F7FC",
                fontFamily: "var(--font-data)",
                letterSpacing: "-0.02em",
              }}
            >
              {formatValue(value, format)}
            </p>
          </div>

          {icon && (
            <div
              className="p-2 rounded-lg"
              style={{ background: `${accentColor}15` }}
            >
              {icon}
            </div>
          )}

          {sparklineData && (
            <MiniSparkline
              data={sparklineData}
              color={
                isPositive ? "var(--velox-velocity)" : "var(--velox-signal)"
              }
            />
          )}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
            <span
              className="text-xs font-medium"
              style={{ color: trendColor, fontFamily: "var(--font-data)" }}
            >
              {isPositive ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs" style={{ color: "var(--velox-mist)" }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
