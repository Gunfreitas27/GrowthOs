"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Megaphone,
  Facebook,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

interface ChannelData {
  id: string;
  name: string;
  displayName: string;
  type: string;
  icon: string;
  status: string;
  metrics: {
    impressions?: number;
    clicks?: number;
    spend?: number;
    revenue?: number;
    conversions?: number;
    roas?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    users?: number;
    sessions?: number;
  };
}

const mockChannels: ChannelData[] = [
  {
    id: "google-analytics",
    name: "google-analytics",
    displayName: "Google Analytics 4",
    type: "ANALYTICS",
    icon: "BarChart3",
    status: "ACTIVE",
    metrics: {
      users: 24580,
      sessions: 38920,
      conversions: 1234,
      revenue: 89450,
    },
  },
  {
    id: "google-ads",
    name: "google-ads",
    displayName: "Google Ads",
    type: "ADS",
    icon: "Megaphone",
    status: "ACTIVE",
    metrics: {
      impressions: 1250000,
      clicks: 45000,
      spend: 32500,
      conversions: 892,
      revenue: 67800,
      roas: 2.09,
      ctr: 3.6,
      cpc: 0.72,
    },
  },
  {
    id: "meta-ads",
    name: "meta-ads",
    displayName: "Meta Ads",
    type: "ADS",
    icon: "Facebook",
    status: "ACTIVE",
    metrics: {
      impressions: 2100000,
      clicks: 63000,
      spend: 41200,
      conversions: 1245,
      revenue: 93400,
      roas: 2.27,
      ctr: 3.0,
      cpc: 0.65,
    },
  },
];

const mockDailyData = [
  { date: "01/03", ga: 820, gAds: 12400, meta: 18600 },
  { date: "02/03", ga: 890, gAds: 13200, meta: 19400 },
  { date: "03/03", ga: 780, gAds: 11800, meta: 17200 },
  { date: "04/03", ga: 920, gAds: 14100, meta: 20100 },
  { date: "05/03", ga: 1050, gAds: 15800, meta: 22500 },
  { date: "06/03", ga: 980, gAds: 14900, meta: 21800 },
  { date: "07/03", ga: 1100, gAds: 16200, meta: 23800 },
];

const mockSpendData = [
  { date: "01/03", googleAds: 1050, metaAds: 1320 },
  { date: "02/03", googleAds: 1080, metaAds: 1380 },
  { date: "03/03", googleAds: 980, metaAds: 1240 },
  { date: "04/03", googleAds: 1150, metaAds: 1420 },
  { date: "05/03", googleAds: 1280, metaAds: 1560 },
  { date: "06/03", googleAds: 1200, metaAds: 1480 },
  { date: "07/03", googleAds: 1350, metaAds: 1650 },
];

const mockChannelDistribution = [
  { name: "Google Ads", value: 44, color: COLORS.pulse },
  { name: "Meta Ads", value: 56, color: COLORS.velocity },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    ACTIVE: { icon: CheckCircle2, color: COLORS.velocity, label: "Ativo" },
    PAUSED: { icon: AlertCircle, color: COLORS.insight, label: "Pausado" },
    ERROR: { icon: XCircle, color: COLORS.signal, label: "Erro" },
    DISCONNECTED: { icon: XCircle, color: COLORS.mist, label: "Desconectado" },
  };

  const config =
    configs[status as keyof typeof configs] || configs.DISCONNECTED;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: `${config.color}15`,
        color: config.color,
        padding: "4px 10px",
        borderRadius: "100px",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function MetricCard({ label, value, subValue, trend, format = "number" }: any) {
  const isPositive = trend >= 0;
  const displayValue =
    format === "currency" ? formatCurrency(value) : formatNumber(value);

  return (
    <div
      style={{
        background: "rgba(26,24,46,0.4)",
        borderRadius: "8px",
        padding: "12px 16px",
        border: "1px solid rgba(107,79,232,0.1)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: COLORS.mist,
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "20px",
          fontWeight: 600,
          color: "#F8F7FC",
          marginBottom: "4px",
        }}
      >
        {displayValue}
      </p>
      {subValue && (
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "11px",
            color: COLORS.mist,
          }}
        >
          {subValue}
        </p>
      )}
      {trend !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "6px",
          }}
        >
          {isPositive ? (
            <TrendingUp
              className="w-3 h-3"
              style={{ color: COLORS.velocity }}
            />
          ) : (
            <TrendingDown
              className="w-3 h-3"
              style={{ color: COLORS.signal }}
            />
          )}
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "11px",
              color: isPositive ? COLORS.velocity : COLORS.signal,
            }}
          >
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function ChannelsView() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7d");

  const totalSpend = mockChannels
    .filter((c) => c.metrics.spend)
    .reduce((acc, c) => acc + (c.metrics.spend || 0), 0);

  const totalRevenue = mockChannels
    .filter((c) => c.metrics.revenue)
    .reduce((acc, c) => acc + (c.metrics.revenue || 0), 0);

  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Total Investido
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#F8F7FC",
                    marginTop: "4px",
                  }}
                >
                  {formatCurrency(totalSpend)}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${COLORS.pulse}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Megaphone
                  className="w-5 h-5"
                  style={{ color: COLORS.pulse }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Receita Total
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#F8F7FC",
                    marginTop: "4px",
                  }}
                >
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${COLORS.velocity}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: COLORS.velocity }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  ROAS Médio
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: avgRoas >= 2 ? COLORS.velocity : COLORS.insight,
                    marginTop: "4px",
                  }}
                >
                  {avgRoas.toFixed(2)}x
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${COLORS.insight}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3
                  className="w-5 h-5"
                  style={{ color: COLORS.insight }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Canais Ativos
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#F8F7FC",
                    marginTop: "4px",
                  }}
                >
                  {mockChannels.filter((c) => c.status === "ACTIVE").length}/
                  {mockChannels.length}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${COLORS.pulse}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: COLORS.pulse }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spend Trend */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Investimento por Canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockSpendData}>
                <defs>
                  <linearGradient
                    id="colorGoogleAds"
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
                  <linearGradient id="colorMetaAds" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="date"
                  stroke={COLORS.mist}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={COLORS.mist}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
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
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString()}`,
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="googleAds"
                  stroke={COLORS.pulse}
                  fillOpacity={1}
                  fill="url(#colorGoogleAds)"
                  name="Google Ads"
                />
                <Area
                  type="monotone"
                  dataKey="metaAds"
                  stroke={COLORS.velocity}
                  fillOpacity={1}
                  fill="url(#colorMetaAds)"
                  name="Meta Ads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Distribuição de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center justify-center"
              style={{ height: 250 }}
            >
              <PieChart width={200} height={200}>
                <Pie
                  data={mockChannelDistribution}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockChannelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1A182E",
                    border: "1px solid rgba(107,79,232,0.25)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-ui)",
                    fontSize: "12px",
                    color: "#F8F7FC",
                  }}
                  formatter={(value) => [`${value}%`, ""]}
                />
              </PieChart>
              <div className="ml-6 space-y-3">
                {mockChannelDistribution.map((channel) => (
                  <div key={channel.name} className="flex items-center gap-2">
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "3px",
                        background: channel.color,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "13px",
                        color: COLORS.mist,
                      }}
                    >
                      {channel.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "13px",
                        color: "#F8F7FC",
                        fontWeight: 500,
                      }}
                    >
                      {channel.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions Trend */}
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#F8F7FC",
              }}
            >
              Conversões Diárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockDailyData}>
                <XAxis
                  dataKey="date"
                  stroke={COLORS.mist}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={COLORS.mist}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
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
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString()}`,
                    "",
                  ]}
                />
                <Bar
                  dataKey="gAds"
                  fill={COLORS.pulse}
                  name="Google Ads"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="meta"
                  fill={COLORS.velocity}
                  name="Meta Ads"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Cards */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "18px",
            color: "#F8F7FC",
            marginBottom: "16px",
          }}
        >
          Canais Conectados
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {mockChannels.map((channel) => (
            <Card
              key={channel.id}
              style={{
                background: "rgba(26,24,46,0.6)",
                border:
                  selectedChannel === channel.id
                    ? "1px solid rgba(107,79,232,0.4)"
                    : "1px solid rgba(107,79,232,0.15)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: `${COLORS.pulse}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {channel.icon === "BarChart3" && (
                      <BarChart3
                        className="w-5 h-5"
                        style={{ color: COLORS.pulse }}
                      />
                    )}
                    {channel.icon === "Megaphone" && (
                      <Megaphone
                        className="w-5 h-5"
                        style={{ color: COLORS.pulse }}
                      />
                    )}
                    {channel.icon === "Facebook" && (
                      <Facebook
                        className="w-5 h-5"
                        style={{ color: COLORS.velocity }}
                      />
                    )}
                  </div>
                  <div>
                    <CardTitle
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#F8F7FC",
                      }}
                    >
                      {channel.displayName}
                    </CardTitle>
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "11px",
                        color: COLORS.mist,
                      }}
                    >
                      {channel.type}
                    </p>
                  </div>
                </div>
                <StatusBadge status={channel.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {channel.id === "google-analytics" ? (
                    <>
                      <MetricCard
                        label="Usuários"
                        value={channel.metrics.users}
                        trend={12}
                      />
                      <MetricCard
                        label="Sessões"
                        value={channel.metrics.sessions}
                        trend={8}
                      />
                      <MetricCard
                        label="Conversões"
                        value={channel.metrics.conversions}
                        trend={15}
                      />
                      <MetricCard
                        label="Receita"
                        value={channel.metrics.revenue}
                        format="currency"
                        trend={18}
                      />
                    </>
                  ) : (
                    <>
                      <MetricCard
                        label="Impressões"
                        value={channel.metrics.impressions || 0}
                        trend={5}
                      />
                      <MetricCard
                        label="Cliques"
                        value={channel.metrics.clicks || 0}
                        trend={8}
                      />
                      <MetricCard
                        label="CTR"
                        value={channel.metrics.ctr || 0}
                        subValue={`CPC R$ ${channel.metrics.cpc?.toFixed(2)}`}
                      />
                      <MetricCard
                        label="ROAS"
                        value={channel.metrics.roas || 0}
                        subValue="retorno"
                      />
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    style={{
                      borderColor: "rgba(107,79,232,0.3)",
                      color: COLORS.mist,
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Sincronizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: "rgba(107,79,232,0.3)",
                      color: COLORS.mist,
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
