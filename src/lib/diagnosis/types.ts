import { MetricCategory } from "@/types/enums";

export interface FunnelStage {
    category: MetricCategory;
    value: number;
    conversionRate?: number; // Percentage from previous stage
}

export interface Bottleneck {
    stage: MetricCategory;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    dropPercentage: number; // How much worse than expected
    expectedValue: number;
    actualValue: number;
    probableCauses: string[];
    evidence: string[];
}

export interface DiagnosisResult {
    overallHealth: "HEALTHY" | "WARNING" | "CRITICAL";
    bottlenecks: Bottleneck[];
    recommendations: {
        title: string;
        description: string;
        impact: "HIGH" | "MEDIUM" | "LOW";
        effort: "HIGH" | "MEDIUM" | "LOW";
        stage: MetricCategory;
    }[];
    analyzedAt: Date;
}
