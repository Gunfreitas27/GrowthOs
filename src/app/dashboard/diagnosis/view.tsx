'use client';

import { useEffect, useState } from "react";
import { runDiagnosis } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Lightbulb,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
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

const EFFORT_LABELS: Record<string, string> = {
  HIGH: 'Alto',
  MEDIUM: 'Médio',
  LOW: 'Baixo',
};

const healthConfig: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  HEALTHY: { color: COLORS.velocity, bg: 'rgba(26,211,197,0.1)', icon: CheckCircle2 },
  WARNING: { color: COLORS.insight, bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle },
  CRITICAL: { color: COLORS.signal, bg: 'rgba(239,68,68,0.1)', icon: AlertCircle },
};

const severityConfig: Record<string, string> = {
  CRITICAL: COLORS.signal,
  HIGH: '#F97316',
  MEDIUM: COLORS.insight,
  LOW: COLORS.pulse,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: COLORS.pulse }} />
        <span className="ml-3" style={{ color: COLORS.mist }}>
          Analisando métricas e executando diagnóstico...
        </span>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="text-center py-20" style={{ color: COLORS.mist }}>
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum diagnóstico disponível</p>
        <Button
          onClick={loadDiagnosis}
          className="mt-4"
          style={{ background: COLORS.pulse, color: "white" }}
        >
          Executar Diagnóstico
        </Button>
      </div>
    );
  }

  const healthConf = healthConfig[diagnosis.overallHealth as keyof typeof healthConfig] || healthConfig.WARNING;
  const HealthIcon = healthConf.icon;

  const impactColors: Record<string, { text: string; bg: string }> = {
    HIGH: { text: COLORS.signal, bg: 'rgba(239,68,68,0.15)' },
    MEDIUM: { text: COLORS.insight, bg: 'rgba(245,158,11,0.15)' },
    LOW: { text: COLORS.pulse, bg: 'rgba(107,79,232,0.15)' },
  };

  const effortColors: Record<string, { text: string; bg: string }> = {
    HIGH: { text: COLORS.signal, bg: 'rgba(239,68,68,0.15)' },
    MEDIUM: { text: COLORS.insight, bg: 'rgba(245,158,11,0.15)' },
    LOW: { text: COLORS.velocity, bg: 'rgba(26,211,197,0.15)' },
  };

  return (
    <div className="space-y-8">
      {/* Overall Health */}
      <Card
        style={{
          background: healthConf.bg,
          border: `1px solid ${healthConf.color}30`,
          borderRadius: "12px",
        }}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <HealthIcon className="w-8 h-8" style={{ color: healthConf.color }} />
            <div>
              <CardTitle style={{ color: "#F8F7FC", fontFamily: "var(--font-display)" }}>
                Saúde do Funil: {HEALTH_LABELS[diagnosis.overallHealth] ?? diagnosis.overallHealth}
              </CardTitle>
              <CardDescription style={{ color: COLORS.mist }}>
                {diagnosis.bottlenecks.length} etapa{diagnosis.bottlenecks.length !== 1 ? 's' : ''} com problemas identificada{diagnosis.bottlenecks.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={loadDiagnosis}
            variant="outline"
            size="sm"
            style={{
              borderColor: "rgba(107,79,232,0.3)",
              color: COLORS.mist,
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rediagnosticar
          </Button>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      {diagnosis.bottlenecks.length > 0 && (
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
            Gargalos Detectados
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {diagnosis.bottlenecks.map((b: any, i: number) => {
              const sevColor = severityConfig[b.severity as keyof typeof severityConfig] || COLORS.insight;
              return (
                <Card
                  key={i}
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    border: `1px solid ${sevColor}30`,
                    borderLeft: `4px solid ${sevColor}`,
                    borderRadius: "12px",
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle
                        style={{
                          fontSize: "16px",
                          color: "#F8F7FC",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {b.stage}
                      </CardTitle>
                      <Badge
                        style={{
                          background: `${sevColor}20`,
                          color: sevColor,
                          border: "none",
                          fontSize: "10px",
                        }}
                      >
                        {SEVERITY_LABELS[b.severity] ?? b.severity}
                      </Badge>
                    </div>
                    <CardDescription style={{ color: COLORS.mist }}>
                      <span style={{ color: COLORS.signal, fontWeight: 600 }}>
                        {b.dropPercentage.toFixed(1)}%
                      </span>{" "}
                      abaixo do desempenho esperado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {b.evidence && b.evidence.length > 0 && (
                      <div>
                        <h4
                          className="text-sm font-semibold mb-2"
                          style={{ color: COLORS.pulse }}
                        >
                          Evidências:
                        </h4>
                        <ul className="space-y-1">
                          {b.evidence.map((e: string, j: number) => (
                            <li
                              key={j}
                              className="text-sm flex items-start gap-2"
                              style={{ color: COLORS.mist }}
                            >
                              <span style={{ color: COLORS.pulse }}>•</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {b.probableCauses && b.probableCauses.length > 0 && (
                      <div>
                        <h4
                          className="text-sm font-semibold mb-2"
                          style={{ color: COLORS.insight }}
                        >
                          Prováveis Causas:
                        </h4>
                        <ul className="space-y-1">
                          {b.probableCauses.map((c: string, j: number) => (
                            <li
                              key={j}
                              className="text-sm flex items-start gap-2"
                              style={{ color: COLORS.mist }}
                            >
                              <span style={{ color: COLORS.insight }}>•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {diagnosis.recommendations.length > 0 && (
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
            Ações Recomendadas
          </h2>
          <div className="space-y-4">
            {diagnosis.recommendations.map((r: any, i: number) => {
              const impConf = impactColors[r.impact as keyof typeof impactColors] || impactColors.MEDIUM;
              const effConf = effortColors[r.effort as keyof typeof effortColors] || effortColors.MEDIUM;
              return (
                <Card
                  key={i}
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    border: "1px solid rgba(107,79,232,0.15)",
                    borderRadius: "12px",
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" style={{ color: COLORS.insight }} />
                        <CardTitle
                          style={{
                            fontSize: "16px",
                            color: "#F8F7FC",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {r.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          style={{
                            background: impConf.bg,
                            color: impConf.text,
                            border: "none",
                            fontSize: "10px",
                          }}
                        >
                          Impacto: {IMPACT_LABELS[r.impact] ?? r.impact}
                        </Badge>
                        <Badge
                          style={{
                            background: effConf.bg,
                            color: effConf.text,
                            border: "none",
                            fontSize: "10px",
                          }}
                        >
                          Esforço: {EFFORT_LABELS[r.effort] ?? r.effort}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription style={{ color: COLORS.mist }}>
                      Etapa: {r.stage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm" style={{ color: "#F8F7FC" }}>
                      {r.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {diagnosis.bottlenecks.length === 0 && (
        <Card
          style={{
            background: "rgba(26,211,197,0.1)",
            border: "1px solid rgba(26,211,197,0.25)",
            borderRadius: "12px",
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" style={{ color: COLORS.velocity }} />
              <div>
                <CardTitle
                  style={{
                    color: COLORS.velocity,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Nenhum Problema Detectado
                </CardTitle>
                <CardDescription style={{ color: COLORS.mist }}>
                  Seu funil está funcionando bem em todas as etapas!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
