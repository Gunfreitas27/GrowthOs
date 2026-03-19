'use client';

import { useEffect, useState } from "react";
import { runDiagnosis } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

// Maps AARRR stage names from diagnosis to experiment funnel stage values
const STAGE_TO_FUNNEL: Record<string, string> = {
    ACQUISITION: 'acquisition',
    ACTIVATION: 'activation',
    RETENTION: 'retention',
    REFERRAL: 'referral',
    REVENUE: 'revenue',
    Acquisition: 'acquisition',
    Activation: 'activation',
    Retention: 'retention',
    Referral: 'referral',
    Revenue: 'revenue',
};

const HEALTH_LABELS: Record<string, string> = {
    HEALTHY: 'Saudável',
    WARNING: 'Atenção',
    CRITICAL: 'Crítico',
};

const SEVERITY_LABELS: Record<string, string> = {
    CRITICAL: 'Crítico',
    HIGH: 'Alto',
    MEDIUM: 'Médio',
    LOW: 'Baixo',
};

const IMPACT_LABELS: Record<string, string> = {
    HIGH: 'Alto',
    MEDIUM: 'Médio',
    LOW: 'Baixo',
};

export default function DiagnosisView() {
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadDiagnosis = async () => {
        setLoading(true);
        try {
            const result = await runDiagnosis();
            setDiagnosis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDiagnosis();
    }, []);

    if (loading) return <div>Executando diagnóstico...</div>;
    if (!diagnosis) return <div>Nenhum diagnóstico disponível</div>;

    const healthColors = {
        HEALTHY: "bg-green-100 text-green-800 border-green-300",
        WARNING: "bg-yellow-100 text-yellow-800 border-yellow-300",
        CRITICAL: "bg-red-100 text-red-800 border-red-300",
    };

    const severityColors = {
        CRITICAL: "bg-red-500",
        HIGH: "bg-orange-500",
        MEDIUM: "bg-yellow-500",
        LOW: "bg-blue-500",
    };

    return (
        <div className="space-y-8">
            {/* Saúde Geral */}
            <Card className={`border-2 ${healthColors[diagnosis.overallHealth as keyof typeof healthColors]}`}>
                <CardHeader>
                    <CardTitle>Saúde do Funil: {HEALTH_LABELS[diagnosis.overallHealth] ?? diagnosis.overallHealth}</CardTitle>
                    <CardDescription>
                        {diagnosis.bottlenecks.length} etapa{diagnosis.bottlenecks.length !== 1 ? 's' : ''} com problemas identificada{diagnosis.bottlenecks.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={loadDiagnosis} variant="outline" size="sm">
                        Rediagnosticar
                    </Button>
                </CardContent>
            </Card>

            {/* Gargalos */}
            {diagnosis.bottlenecks.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Gargalos Detectados</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {diagnosis.bottlenecks.map((b: any, i: number) => (
                            <Card key={i} className="border-l-4" style={{ borderLeftColor: severityColors[b.severity as keyof typeof severityColors].replace('bg-', '#') }}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{b.stage}</CardTitle>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${severityColors[b.severity as keyof typeof severityColors]}`}>
                                            {SEVERITY_LABELS[b.severity] ?? b.severity}
                                        </span>
                                    </div>
                                    <CardDescription>
                                        {b.dropPercentage.toFixed(1)}% abaixo do desempenho esperado
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Evidências:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {b.evidence.map((e: string, j: number) => (
                                                <li key={j}>• {e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Prováveis Causas:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {b.probableCauses.map((c: string, j: number) => (
                                                <li key={j}>• {c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Recomendações */}
            {diagnosis.recommendations.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Ações Recomendadas</h2>
                    <div className="space-y-4">
                        {diagnosis.recommendations.map((r: any, i: number) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{r.title}</CardTitle>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${r.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                    r.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                Impacto: {IMPACT_LABELS[r.impact] ?? r.impact}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${r.effort === 'HIGH' ? 'bg-purple-100 text-purple-800' :
                                                    r.effort === 'MEDIUM' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                Esforço: {IMPACT_LABELS[r.effort] ?? r.effort}
                                            </span>
                                        </div>
                                    </div>
                                    <CardDescription>Etapa: {r.stage}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-700">{r.description}</p>
                                    <div className="pt-1">
                                        <Link
                                            href={`/dashboard/experiments?stage=${STAGE_TO_FUNNEL[r.stage] ?? 'acquisition'}&from=diagnosis`}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                                            style={{ background: 'rgba(107, 79, 232, 0.1)', color: 'var(--velox-pulse)' }}
                                        >
                                            <FlaskConical className="w-3 h-3" />
                                            Criar experimento para este problema
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {diagnosis.bottlenecks.length === 0 && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">🎉 Nenhum Problema Detectado</CardTitle>
                        <CardDescription>Seu funil está funcionando bem em todas as etapas!</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
