"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
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
  Loader2,
  Plus,
  MousePointerClick,
  DollarSign,
  Eye,
} from "lucide-react";
import {
  getChannels,
  syncChannel,
  connectChannel,
  disconnectChannel,
  type ChannelData,
} from "./actions";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

const CONNECTOR_OPTIONS = [
  { value: "google-analytics", label: "Google Analytics 4", icon: "BarChart3" },
  { value: "google-ads", label: "Google Ads", icon: "Megaphone" },
  { value: "meta-ads", label: "Meta Ads", icon: "Facebook" },
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
  const configs: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: COLORS.velocity, label: "Ativo" },
    PAUSED: { color: COLORS.insight, label: "Pausado" },
    ERROR: { color: COLORS.signal, label: "Erro" },
    DISCONNECTED: { color: COLORS.mist, label: "Desconectado" },
  };

  const config = configs[status] || configs.DISCONNECTED;

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
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  subValue,
  trend,
  format = "number",
}: {
  label: string;
  value: number;
  subValue?: string;
  trend?: number;
  format?: "number" | "currency";
}) {
  const isPositive = trend !== undefined ? trend >= 0 : true;
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

function ChannelIcon({ type, icon }: { type: string; icon?: string }) {
  const IconComponent = icon === "Megaphone" ? Megaphone : icon === "Facebook" ? Facebook : BarChart3;
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "rgba(107,79,232,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconComponent className="w-5 h-5" style={{ color: COLORS.pulse }} />
    </div>
  );
}

const ICON_MAP: Record<string, string> = {
  "google-analytics": "BarChart3",
  "google-ads": "Megaphone",
  "meta-ads": "Facebook",
};

interface ChannelsViewProps {
  initialChannels: ChannelData[];
}

export default function ChannelsView({ initialChannels }: ChannelsViewProps) {
  const [channels, setChannels] = useState<ChannelData[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConnector, setShowConnector] = useState(false);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getChannels();
      setChannels(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = async (channelId: string) => {
    setSyncing(channelId);
    try {
      await syncChannel(channelId);
      await fetchChannels();
    } finally {
      setSyncing(null);
    }
  };

  const handleConnect = async (connectorType: string, displayName: string) => {
    await connectChannel(connectorType, displayName);
    await fetchChannels();
    setShowConnector(false);
  };

  const handleDisconnect = async (channelId: string) => {
    await disconnectChannel(channelId);
    await fetchChannels();
  };

  const activeChannels = channels.filter((c) => c.status === "ACTIVE");
  const totalSpend = activeChannels.reduce((acc, c) => acc + c.metrics.spend, 0);
  const totalRevenue = activeChannels.reduce((acc, c) => acc + c.metrics.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const spendData = channels
    .filter((c) => c.spends.length > 0)
    .flatMap((c) => c.spends.map((s) => ({ ...s, channelId: c.id, channelName: c.displayName })))
    .slice(-30);

  const channelDistribution = activeChannels.map((c, i) => ({
    name: c.displayName,
    value: totalSpend > 0 ? Math.round((c.metrics.spend / totalSpend) * 100) : 0,
    color: i === 0 ? COLORS.pulse : i === 1 ? COLORS.velocity : COLORS.insight,
  }));

  const dailyConversions = channels
    .filter((c) => c.dailyMetrics.length > 0)
    .flatMap((c) => c.dailyMetrics.map((m) => ({ ...m, channelName: c.displayName })))
    .slice(-30);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div style={{ color: COLORS.mist, fontSize: "13px" }}>
          {activeChannels.length} de {channels.length} canais ativos
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChannels}
            disabled={loading}
            style={{
              borderColor: "rgba(107,79,232,0.3)",
              color: COLORS.mist,
            }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setShowConnector(true)}
            style={{ background: COLORS.pulse, color: "white" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Conectar Canal
          </Button>
        </div>
      </div>

      {/* Connect Dialog */}
      {showConnector && (
        <Card
          style={{
            background: "rgba(26,24,46,0.9)",
            border: "1px solid rgba(107,79,232,0.3)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#F8F7FC",
              }}
            >
              Conectar Novo Canal
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnector(false)}
              style={{ color: COLORS.mist }}
            >
              ✕ Fechar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {CONNECTOR_OPTIONS.map((opt) => {
                const alreadyConnected = channels.some(
                  (c) => c.connectorType === opt.value && c.status === "ACTIVE",
                );
                return (
                  <Button
                    key={opt.value}
                    variant="outline"
                    disabled={alreadyConnected}
                    onClick={() => handleConnect(opt.value, opt.label)}
                    className="h-auto flex-col gap-2 py-6"
                    style={{
                      borderColor: alreadyConnected
                        ? "rgba(26,211,197,0.3)"
                        : "rgba(107,79,232,0.3)",
                      color: alreadyConnected ? COLORS.velocity : "#F8F7FC",
                    }}
                  >
                    {opt.icon === "Megaphone" ? (
                      <Megaphone className="w-8 h-8" style={{ color: COLORS.pulse }} />
                    ) : opt.icon === "Facebook" ? (
                      <Facebook className="w-8 h-8" style={{ color: COLORS.velocity }} />
                    ) : (
                      <BarChart3 className="w-8 h-8" style={{ color: COLORS.pulse }} />
                    )}
                    <span className="text-sm">{opt.label}</span>
                    {alreadyConnected && (
                      <span className="text-xs" style={{ color: COLORS.velocity }}>
                        Já conectado
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  background: "rgba(107,79,232,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DollarSign className="w-5 h-5" style={{ color: COLORS.pulse }} />
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
                  background: "rgba(26,211,197,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: COLORS.velocity }} />
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
                  background: "rgba(245,158,11,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: COLORS.insight }} />
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
                  {activeChannels.length}/{channels.length}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(107,79,232,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.pulse }} />
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
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="colorSpend1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.pulse} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.pulse} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpend2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.velocity} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.velocity} stopOpacity={0} />
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
                  formatter={(value) => [`R$ ${(value || 0).toLocaleString()}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.pulse}
                  fillOpacity={1}
                  fill="url(#colorSpend1)"
                  name="Investimento"
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
            <div className="flex items-center justify-center" style={{ height: 250 }}>
              {channelDistribution.length > 0 ? (
                <>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={channelDistribution}
                      cx={100}
                      cy={100}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelDistribution.map((entry, index) => (
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
                      formatter={(value) => [`${value || 0}%`, ""]}
                    />
                  </PieChart>
                  <div className="ml-6 space-y-3">
                    {channelDistribution.map((channel) => (
                      <div key={channel.name} className="flex items-center gap-2">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "3px",
                            background: channel.color,
                          }}
                        />
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: COLORS.mist }}>
                          {channel.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-data)", fontSize: "13px", color: "#F8F7FC", fontWeight: 500 }}>
                          {channel.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: COLORS.mist }}>Nenhum dado disponível</p>
              )}
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
              <BarChart data={dailyConversions}>
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
                  formatter={(value) => [(value || 0).toLocaleString(), "Conversões"]}
                />
                <Bar
                  dataKey="conversions"
                  fill={COLORS.pulse}
                  name="Conversões"
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
          {channels.map((channel) => (
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
                  <ChannelIcon
                    type={channel.connectorType}
                    icon={ICON_MAP[channel.connectorType]}
                  />
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
                      {channel.lastSyncAt
                        ? `Último sync: ${new Date(channel.lastSyncAt).toLocaleDateString()}`
                        : "Nunca sincronizado"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={channel.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {channel.connectorType === "google-analytics" ? (
                    <>
                      <MetricCard label="Usuários" value={channel.metrics.users} />
                      <MetricCard label="Sessões" value={channel.metrics.sessions} />
                      <MetricCard label="Conversões" value={channel.metrics.conversions} />
                      <MetricCard
                        label="Receita"
                        value={channel.metrics.revenue}
                        format="currency"
                      />
                    </>
                  ) : (
                    <>
                      <MetricCard label="Impressões" value={channel.metrics.impressions} />
                      <MetricCard label="Cliques" value={channel.metrics.clicks} />
                      <MetricCard
                        label="CTR"
                        value={channel.metrics.ctr}
                        subValue={`CPC R$ ${channel.metrics.cpc.toFixed(2)}`}
                      />
                      <MetricCard
                        label="ROAS"
                        value={channel.metrics.roas}
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
                    disabled={syncing === channel.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSync(channel.id);
                    }}
                    style={{
                      borderColor: "rgba(107,79,232,0.3)",
                      color: COLORS.mist,
                    }}
                  >
                    {syncing === channel.id ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-2" />
                    )}
                    {syncing === channel.id ? "Sincronizando..." : "Sincronizar"}
                  </Button>
                  {channel.status === "ACTIVE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(channel.id);
                      }}
                      style={{
                        borderColor: "rgba(239,68,68,0.3)",
                        color: COLORS.signal,
                      }}
                    >
                      <XCircle className="w-3 h-3 mr-2" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(channel.connectorType, channel.displayName);
                      }}
                      style={{
                        borderColor: "rgba(26,211,197,0.3)",
                        color: COLORS.velocity,
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      Reconectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {channels.length === 0 && (
          <div className="text-center py-12">
            <BarChart3
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: COLORS.mist, opacity: 0.5 }}
            />
            <p style={{ color: COLORS.mist, fontFamily: "var(--font-ui)" }}>
              Nenhum canal conectado
            </p>
            <p className="text-sm mt-1" style={{ color: COLORS.mist, opacity: 0.7 }}>
              Conecte Google Analytics, Google Ads ou Meta Ads para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
