"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { MoreHorizontal, Download, RefreshCw } from "lucide-react";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
  indigo: "#2D1B6B",
};

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  type: "area" | "bar" | "line" | "pie";
  data: unknown[];
  dataKey: string;
  categories?: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#1A182E",
        border: "1px solid rgba(107,79,232,0.25)",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-xs mb-2" style={{ color: COLORS.mist }}>
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-sm" style={{ color: "#F8F7FC" }}>
            {entry.name}: <strong>{entry.value.toLocaleString("pt-BR")}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

export function ChartWidget({
  title,
  subtitle,
  type,
  data,
  dataKey,
  categories = ["value"],
  colors = [COLORS.pulse, COLORS.velocity, COLORS.insight],
  height = 300,
  showLegend = false,
  showTooltip = true,
}: ChartWidgetProps) {
  const chartColors = categories.length > 1 ? colors : [COLORS.pulse];

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {categories.map((cat, i) => (
                  <linearGradient
                    key={cat}
                    id={`gradient-${cat}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartColors[i]}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColors[i]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey={dataKey}
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
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {categories.map((cat, i) => (
                <Area
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={chartColors[i]}
                  fillOpacity={1}
                  fill={`url(#gradient-${cat})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey={dataKey}
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
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {categories.map((cat, i) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  fill={chartColors[i]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey={dataKey}
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
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {categories.map((cat, i) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={chartColors[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: chartColors[i] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_: unknown, i: number) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      style={{
        background: "rgba(26,24,46,0.6)",
        border: "1px solid rgba(107,79,232,0.12)",
        borderRadius: "12px",
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
            {title}
          </CardTitle>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--velox-mist)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw
              className="w-4 h-4"
              style={{ color: "var(--velox-mist)" }}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download
              className="w-4 h-4"
              style={{ color: "var(--velox-mist)" }}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal
              className="w-4 h-4"
              style={{ color: "var(--velox-mist)" }}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">{renderChart()}</CardContent>
    </Card>
  );
}
