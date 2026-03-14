'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { VelocityData } from './actions';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, suffix = '' }: { title: string; value: string | number; suffix?: string }) {
    return (
        <Card className="velox-kpi-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="velox-label text-xs" style={{ color: 'var(--velox-mist)' }}>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="velox-data text-2xl font-bold">
                    {value}{suffix}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Mini AARRR Funnel ────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
    awareness: 'bg-purple-400',
    acquisition: 'bg-blue-400',
    activation: 'bg-green-400',
    retention: 'bg-yellow-400',
    revenue: 'bg-emerald-400',
    referral: 'bg-pink-400',
};

function MiniFunnel({ data }: { data: { stage: string; count: number }[] }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="space-y-2">
            {data.map(d => (
                <div key={d.stage} className="flex items-center gap-3 text-sm">
                    <span className="w-24 capitalize text-gray-600">{d.stage}</span>
                    <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
                        <div
                            className={`h-full rounded transition-all ${STAGE_COLORS[d.stage] ?? 'bg-gray-400'}`}
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                        />
                    </div>
                    <span className="w-6 text-right text-gray-500 font-medium">{d.count}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function VelocityView({ data }: { data: VelocityData }) {
    const { kpis, weeklyData, funnelStageBreakdown, staleExperiments } = data;

    return (
        <div className="space-y-8">
            {/* KPI Cards row 1 */}
            <div className="grid gap-4 md:grid-cols-4">
                <KpiCard title="Em Execução Agora" value={kpis.runningNow} />
                <KpiCard title="Concluídos (30d)" value={kpis.completedRecently} />
                <KpiCard title="Taxa de Sucesso" value={kpis.winRateAllTime} suffix="%" />
                <KpiCard title="Duração Média" value={kpis.avgDurationDays} suffix=" dias" />
            </div>

            {/* KPI Cards row 2 */}
            <div className="grid gap-4 md:grid-cols-4">
                <KpiCard title="Taxa de Sucesso (30d)" value={kpis.winRate30d} suffix="%" />
                <KpiCard title="Backlog + Ideias" value={kpis.ideasInBacklog} />
                <KpiCard title="Top Etapa" value={kpis.topFunnelStage} />
                <KpiCard title="Total de Aprendizados" value={kpis.totalLearnings} />
            </div>

            {/* Charts row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Weekly bar chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Experimentos criados por semana (últimas 12 semanas)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#6B4FE8" radius={[4, 4, 0, 0]} barSize={24} name="Experimentos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Mini AARRR funnel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Experimentos por etapa AARRR</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MiniFunnel data={funnelStageBreakdown} />
                    </CardContent>
                </Card>
            </div>

            {/* Stale experiments */}
            {staleExperiments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            Experimentos que precisam de atenção
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">Em execução há mais de 30 dias sem atualização.</p>
                        <div className="space-y-2">
                            {staleExperiments.map(e => (
                                <div key={e.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{e.title}</p>
                                        <p className="text-xs text-gray-500 capitalize">{e.funnelStage}</p>
                                    </div>
                                    <span className="text-xs text-yellow-700 font-medium whitespace-nowrap">
                                        {e.daysSinceUpdate}d sem atualização
                                    </span>
                                    <Link
                                        href="/dashboard/experiments"
                                        className="text-xs text-primary hover:underline whitespace-nowrap"
                                    >
                                        Ver →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {staleExperiments.length === 0 && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-green-700 text-center">
                            ✅ Todos os experimentos em execução foram atualizados nos últimos 30 dias!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
