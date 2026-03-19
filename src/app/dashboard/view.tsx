'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "./actions";
import type { TeamSummary } from "./actions";
import Link from "next/link";
import { FlaskConical, TrendingUp, AlertTriangle, BookOpen, ArrowRight, Zap } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
    awareness: 'Reconhecimento',
    acquisition: 'Aquisição',
    activation: 'Ativação',
    retention: 'Retenção',
    revenue: 'Receita',
    referral: 'Indicação',
};

const STAGE_COLORS: Record<string, string> = {
    awareness: 'bg-purple-100 text-purple-700',
    acquisition: 'bg-blue-100 text-blue-700',
    activation: 'bg-green-100 text-green-700',
    retention: 'bg-yellow-100 text-yellow-700',
    revenue: 'bg-emerald-100 text-emerald-700',
    referral: 'bg-pink-100 text-pink-700',
};

export default function DashboardView({ teamSummary }: { teamSummary: TeamSummary }) {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardMetrics().then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-sm" style={{ color: 'var(--velox-mist)' }}>Carregando painel...</div>;

    const hasData = metrics.acquisition.value > 0 || metrics.revenue.value > 0;

    return (
        <div className="space-y-8">
            {/* Team Focus Bar */}
            <TeamFocusBar summary={teamSummary} />

            {/* KPI Cards */}
            {hasData ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <KpiCard title="Aquisição" value={metrics.acquisition.value} trend={metrics.acquisition.trend} />
                        <KpiCard title="Ativação" value={metrics.activation.value} unit={metrics.activation.unit} trend={metrics.activation.trend} />
                        <KpiCard title="Retenção" value={metrics.retention.value} unit={metrics.retention.unit} trend={metrics.retention.trend} />
                        <KpiCard title="Indicação" value={metrics.referral.value} unit={metrics.referral.unit} trend={metrics.referral.trend} />
                        <KpiCard title="Receita" value={metrics.revenue.value} unit={metrics.revenue.unit} trend={metrics.revenue.trend} />
                    </div>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Funil de Conversão</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics.funnelData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#6B4FE8" radius={[4, 4, 0, 0]} barSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <NoDataState />
            )}

            {/* Active Experiments + Recent Learnings */}
            <div className="grid gap-6 md:grid-cols-2">
                <ActiveExperimentsCard summary={teamSummary} />
                <RecentLearningsCard summary={teamSummary} />
            </div>
        </div>
    );
}

// ─── Team Focus Bar ───────────────────────────────────────────────────────────

function TeamFocusBar({ summary }: { summary: TeamSummary }) {
    return (
        <div
            className="flex flex-wrap items-center gap-4 p-4 rounded-xl border text-sm"
            style={{
                background: 'rgba(107, 79, 232, 0.06)',
                borderColor: 'rgba(107, 79, 232, 0.18)',
            }}
        >
            <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" style={{ color: 'var(--velox-pulse)' }} />
                <span className="font-medium">{summary.activeExperiments}</span>
                <span style={{ color: 'var(--velox-mist)' }}>em andamento</span>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--velox-velocity)' }} />
                <span className="font-medium">{summary.winsThisMonth}</span>
                <span style={{ color: 'var(--velox-mist)' }}>ganhos este mês</span>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: 'var(--velox-insight)' }} />
                <span className="font-medium">{summary.backlogCount + summary.ideasCount}</span>
                <span style={{ color: 'var(--velox-mist)' }}>ideias no backlog</span>
            </div>

            {summary.staleCount > 0 && (
                <>
                    <div className="h-4 w-px bg-gray-200" />
                    <Link href="/dashboard/velocity" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-yellow-700">{summary.staleCount}</span>
                        <span className="text-yellow-600">parado{summary.staleCount !== 1 ? 's' : ''} — requer atenção</span>
                    </Link>
                </>
            )}

            <Link
                href="/dashboard/experiments"
                className="ml-auto flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--velox-pulse)' }}
            >
                Ver experimentos <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}

// ─── Active Experiments Card ──────────────────────────────────────────────────

function ActiveExperimentsCard({ summary }: { summary: TeamSummary }) {
    const { inProgressExperiments } = summary;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold tracking-wide" style={{ color: 'var(--velox-mist)' }}>
                        EM ANDAMENTO
                    </CardTitle>
                    <Link href="/dashboard/experiments" className="text-xs hover:opacity-80" style={{ color: 'var(--velox-pulse)' }}>
                        Ver todos →
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {inProgressExperiments.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm" style={{ color: 'var(--velox-mist)' }}>Nenhum experimento em andamento.</p>
                        <Link href="/dashboard/experiments" className="text-xs mt-2 inline-block hover:opacity-80" style={{ color: 'var(--velox-pulse)' }}>
                            Mover do backlog →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {inProgressExperiments.map(exp => (
                            <div key={exp.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                                <FlaskConical className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--velox-pulse)' }} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium leading-snug truncate">{exp.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${STAGE_COLORS[exp.funnelStage] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {STAGE_LABELS[exp.funnelStage] ?? exp.funnelStage}
                                        </span>
                                        {exp.ownerName && (
                                            <span className="text-xs" style={{ color: 'var(--velox-mist)' }}>{exp.ownerName}</span>
                                        )}
                                        {exp.daysSinceUpdate > 7 && (
                                            <span className="text-xs text-yellow-600">{exp.daysSinceUpdate}d sem update</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Recent Learnings Card ────────────────────────────────────────────────────

function RecentLearningsCard({ summary }: { summary: TeamSummary }) {
    const { recentLearnings, recentWins } = summary;

    const RESULT_COLORS: Record<string, string> = {
        validated: 'bg-green-100 text-green-700',
        invalidated: 'bg-red-100 text-red-700',
        inconclusive: 'bg-gray-100 text-gray-600',
    };
    const RESULT_LABELS: Record<string, string> = {
        validated: 'Validado', invalidated: 'Invalidado', inconclusive: 'Inconclusivo',
    };
    const IMPACT_LABELS: Record<string, string> = {
        high: 'Alto impacto', medium: 'Médio impacto', low: 'Baixo impacto',
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold tracking-wide" style={{ color: 'var(--velox-mist)' }}>
                        APRENDIZADOS RECENTES
                    </CardTitle>
                    <Link href="/dashboard/learnings" className="text-xs hover:opacity-80" style={{ color: 'var(--velox-pulse)' }}>
                        Ver todos →
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {recentLearnings.length === 0 ? (
                    <div className="text-center py-6">
                        <BookOpen className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--velox-mist)' }} />
                        <p className="text-sm" style={{ color: 'var(--velox-mist)' }}>Nenhum aprendizado registrado esta semana.</p>
                        <Link href="/dashboard/learnings" className="text-xs mt-2 inline-block hover:opacity-80" style={{ color: 'var(--velox-pulse)' }}>
                            Registrar aprendizado →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentLearnings.map(l => (
                            <div key={l.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                                <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--velox-insight)' }} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium leading-snug truncate">{l.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${RESULT_COLORS[l.resultType] ?? 'bg-gray-100'}`}>
                                            {RESULT_LABELS[l.resultType] ?? l.resultType}
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--velox-mist)' }}>
                                            {IMPACT_LABELS[l.impactLevel] ?? l.impactLevel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {recentWins.length > 0 && (
                            <div className="pt-2 border-t mt-3">
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--velox-velocity)' }}>
                                    GANHOS ESTE MÊS
                                </p>
                                {recentWins.map(w => (
                                    <div key={w.id} className="flex items-center gap-2 py-1">
                                        <span className="text-green-500 text-xs">↑</span>
                                        <span className="text-xs truncate">{w.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── No Data Empty State ──────────────────────────────────────────────────────

function NoDataState() {
    const steps = [
        { num: 1, label: 'Conecte uma fonte de dados', href: '/dashboard/connectors', desc: 'Google Analytics, Ads, CRM ou CSV' },
        { num: 2, label: 'Rode o diagnóstico de funil', href: '/dashboard/diagnosis', desc: 'Identifique gargalos automaticamente' },
        { num: 3, label: 'Crie seus primeiros experimentos', href: '/dashboard/experiments', desc: 'Priorize com ICE ou RICE score' },
    ];

    return (
        <Card className="border-dashed">
            <CardContent className="py-12 text-center">
                <h3 className="text-base font-semibold mb-1">Sem dados de métricas ainda</h3>
                <p className="text-sm mb-8" style={{ color: 'var(--velox-mist)' }}>
                    Conecte uma fonte para ver seus KPIs de growth aqui.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                    {steps.map(step => (
                        <Link
                            key={step.num}
                            href={step.href}
                            className="flex-1 p-4 rounded-xl border text-left hover:border-purple-400 transition-colors"
                            style={{ borderColor: 'rgba(107, 79, 232, 0.2)' }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-3"
                                style={{ background: 'var(--velox-pulse)', color: 'white' }}
                            >
                                {step.num}
                            </div>
                            <p className="text-sm font-medium mb-1">{step.label}</p>
                            <p className="text-xs" style={{ color: 'var(--velox-mist)' }}>{step.desc}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, unit = "", trend }: any) {
    const isPositive = trend >= 0;
    return (
        <Card className="velox-kpi-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="velox-label text-xs" style={{ color: 'var(--velox-mist)' }}>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="velox-data text-2xl font-bold">
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
