'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "./actions";

/* ─── Loading skeleton ────────────────────────────────────────────────────── */

function LoadingSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* KPI skeletons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            background: 'rgba(107,79,232,0.06)',
                            border: '1px solid rgba(107,79,232,0.12)',
                            borderRadius: '12px',
                            padding: '20px',
                            borderLeft: '3px solid rgba(107,79,232,0.3)',
                        }}
                    >
                        <div style={{ width: '60%', height: '10px', borderRadius: '4px', background: 'rgba(168,163,199,0.15)', marginBottom: '16px' }} />
                        <div style={{ width: '80%', height: '24px', borderRadius: '4px', background: 'rgba(168,163,199,0.12)', marginBottom: '8px' }} />
                        <div style={{ width: '50%', height: '10px', borderRadius: '4px', background: 'rgba(168,163,199,0.1)' }} />
                    </div>
                ))}
            </div>
            {/* Chart skeleton */}
            <div
                style={{
                    background: 'rgba(107,79,232,0.06)',
                    border: '1px solid rgba(107,79,232,0.12)',
                    borderRadius: '12px',
                    padding: '24px',
                    height: '420px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                <div style={{ width: '180px', height: '14px', borderRadius: '4px', background: 'rgba(168,163,199,0.15)' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '24px' }}>
                    {[65, 40, 85, 55, 70].map((h, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: `${h}%`,
                                borderRadius: '6px 6px 0 0',
                                background: 'rgba(107,79,232,0.12)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Dashboard View ──────────────────────────────────────────────────────── */

export default function DashboardView() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardMetrics().then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Aquisição"  value={metrics.acquisition.value} trend={metrics.acquisition.trend} />
                <KpiCard title="Ativação"   value={metrics.activation.value}  unit={metrics.activation.unit}  trend={metrics.activation.trend} />
                <KpiCard title="Retenção"   value={metrics.retention.value}   unit={metrics.retention.unit}   trend={metrics.retention.trend} />
                <KpiCard title="Indicação"  value={metrics.referral.value}    unit={metrics.referral.unit}    trend={metrics.referral.trend} />
                <KpiCard title="Receita"    value={metrics.revenue.value}     unit={metrics.revenue.unit}     trend={metrics.revenue.trend} />
            </div>

            {/* Main Chart */}
            <Card
                style={{
                    background: 'rgba(26,24,46,0.6)',
                    border: '1px solid rgba(107,79,232,0.15)',
                    borderRadius: '12px',
                }}
            >
                <CardHeader>
                    <CardTitle
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: '16px',
                            letterSpacing: '-0.02em',
                            color: '#F8F7FC',
                        }}
                    >
                        Funil de Conversão
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={metrics.funnelData}>
                            <XAxis
                                dataKey="name"
                                stroke="var(--velox-mist)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                fontFamily="var(--font-ui)"
                            />
                            <YAxis
                                stroke="var(--velox-mist)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                fontFamily="var(--font-data)"
                                tickFormatter={(v) => `${v}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(107,79,232,0.06)' }}
                                contentStyle={{
                                    background: '#1A182E',
                                    border: '1px solid rgba(107,79,232,0.25)',
                                    borderRadius: '10px',
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '13px',
                                    color: '#F8F7FC',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                }}
                            />
                            <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={56} />
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6B4FE8" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#6B4FE8" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

/* ─── KPI Card ────────────────────────────────────────────────────────────── */

function KpiCard({ title, value, unit = "", trend }: any) {
    const isPositive = trend >= 0;
    return (
        <Card
            style={{
                background: 'rgba(26,24,46,0.6)',
                border: '1px solid rgba(107,79,232,0.15)',
                borderRadius: '12px',
                borderLeft: '3px solid var(--velox-pulse)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="velox-label text-xs" style={{ color: 'var(--velox-mist)' }}>
                    {title}
                </CardTitle>
                <div
                    style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isPositive ? 'var(--velox-velocity)' : 'var(--velox-signal)',
                    }}
                />
            </CardHeader>
            <CardContent>
                <div className="velox-data text-2xl font-bold" style={{ color: '#F8F7FC' }}>
                    {unit === "USD" ? "$" : ""}{value.toLocaleString()}{unit !== "USD" ? unit : ""}
                </div>
                <p
                    className="velox-data text-xs mt-1"
                    style={{ color: isPositive ? 'var(--velox-velocity)' : 'var(--velox-signal)' }}
                >
                    {isPositive ? "+" : ""}{trend}% vs mês anterior
                </p>
            </CardContent>
        </Card>
    );
}
