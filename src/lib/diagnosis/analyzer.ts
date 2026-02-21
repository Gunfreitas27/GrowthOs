import { MetricCategory } from "@/types/enums";
import { DiagnosisResult, Bottleneck, FunnelStage } from "./types";

// Industry benchmark conversion rates (simplified for MVP)
const BENCHMARK_RATES = {
    [MetricCategory.ACQUISITION]: 1.0, // Base stage
    [MetricCategory.ACTIVATION]: 0.40, // 40% of acquired users activate
    [MetricCategory.RETENTION]: 0.30, // 30% of activated users retained
    [MetricCategory.REFERRAL]: 0.15, // 15% of retained users refer
    [MetricCategory.REVENUE]: 0.05, // 5% of users convert to paying
};

// Thresholds for severity classification
const SEVERITY_THRESHOLDS = {
    CRITICAL: 0.50, // 50%+ below benchmark
    HIGH: 0.30, // 30-50% below benchmark
    MEDIUM: 0.15, // 15-30% below benchmark
    LOW: 0.05, // 5-15% below benchmark
};

export function analyzeFunnel(stages: FunnelStage[]): DiagnosisResult {
    const bottlenecks: Bottleneck[] = [];

    // Sort stages in AARRR order
    const orderedStages = [
        MetricCategory.ACQUISITION,
        MetricCategory.ACTIVATION,
        MetricCategory.RETENTION,
        MetricCategory.REFERRAL,
        MetricCategory.REVENUE,
    ];

    const stageMap = new Map(stages.map(s => [s.category, s]));

    // Calculate conversion rates and detect bottlenecks
    for (let i = 1; i < orderedStages.length; i++) {
        const currentStage = orderedStages[i];
        const previousStage = orderedStages[i - 1];

        const current = stageMap.get(currentStage);
        const previous = stageMap.get(previousStage);

        if (!current || !previous || previous.value === 0) continue;

        const actualRate = current.value / previous.value;
        const expectedRate = BENCHMARK_RATES[currentStage];
        const deviation = (expectedRate - actualRate) / expectedRate;

        // Check if significantly below benchmark
        if (deviation > SEVERITY_THRESHOLDS.LOW) {
            const severity =
                deviation > SEVERITY_THRESHOLDS.CRITICAL ? "CRITICAL" :
                    deviation > SEVERITY_THRESHOLDS.HIGH ? "HIGH" :
                        deviation > SEVERITY_THRESHOLDS.MEDIUM ? "MEDIUM" : "LOW";

            bottlenecks.push({
                stage: currentStage,
                severity,
                dropPercentage: deviation * 100,
                expectedValue: previous.value * expectedRate,
                actualValue: current.value,
                probableCauses: getProbableCauses(currentStage, deviation),
                evidence: getEvidence(currentStage, actualRate, expectedRate),
            });
        }
    }

    // Generate recommendations
    const recommendations = bottlenecks.map(b => generateRecommendation(b));

    // Determine overall health
    const overallHealth =
        bottlenecks.some(b => b.severity === "CRITICAL") ? "CRITICAL" :
            bottlenecks.some(b => b.severity === "HIGH") ? "WARNING" : "HEALTHY";

    return {
        overallHealth,
        bottlenecks,
        recommendations,
        analyzedAt: new Date(),
    };
}

function getProbableCauses(stage: MetricCategory, deviation: number): string[] {
    const causes: Record<MetricCategory, string[]> = {
        [MetricCategory.ACQUISITION]: [
            "Low marketing spend or ineffective channels",
            "Poor SEO or organic reach",
            "Weak value proposition in ads",
        ],
        [MetricCategory.ACTIVATION]: [
            "Complex onboarding flow",
            "Unclear value proposition",
            "Technical issues or slow load times",
            "Missing key features in trial",
        ],
        [MetricCategory.RETENTION]: [
            "Lack of engagement features",
            "Poor product-market fit",
            "Inadequate customer support",
            "Missing habit-forming loops",
        ],
        [MetricCategory.REFERRAL]: [
            "No referral program or incentives",
            "Difficult sharing mechanism",
            "Low product satisfaction",
        ],
        [MetricCategory.REVENUE]: [
            "Pricing too high or unclear",
            "Weak monetization strategy",
            "Payment friction",
            "Insufficient value demonstration",
        ],
    };

    return causes[stage] || ["Unknown cause"];
}

function getEvidence(stage: MetricCategory, actualRate: number, expectedRate: number): string[] {
    return [
        `Conversion rate: ${(actualRate * 100).toFixed(1)}% (expected: ${(expectedRate * 100).toFixed(1)}%)`,
        `Gap: ${((expectedRate - actualRate) * 100).toFixed(1)} percentage points`,
    ];
}

function generateRecommendation(bottleneck: Bottleneck) {
    const recommendations: Record<MetricCategory, { title: string; description: string; effort: "HIGH" | "MEDIUM" | "LOW" }> = {
        [MetricCategory.ACQUISITION]: {
            title: "Optimize acquisition channels",
            description: "Review and optimize marketing spend allocation. Focus on high-performing channels and test new acquisition strategies.",
            effort: "MEDIUM",
        },
        [MetricCategory.ACTIVATION]: {
            title: "Simplify onboarding flow",
            description: "Reduce steps to first value. Add interactive tutorials and improve time-to-first-success.",
            effort: "HIGH",
        },
        [MetricCategory.RETENTION]: {
            title: "Implement engagement loops",
            description: "Add email campaigns, push notifications, and in-app engagement features to bring users back.",
            effort: "HIGH",
        },
        [MetricCategory.REFERRAL]: {
            title: "Launch referral program",
            description: "Create incentivized referral program with easy sharing mechanisms.",
            effort: "MEDIUM",
        },
        [MetricCategory.REVENUE]: {
            title: "Optimize pricing and checkout",
            description: "Test pricing tiers, reduce payment friction, and improve value communication.",
            effort: "MEDIUM",
        },
    };

    const rec = recommendations[bottleneck.stage];

    return {
        title: rec.title,
        description: rec.description,
        impact: (bottleneck.severity === "CRITICAL" || bottleneck.severity === "HIGH" ? "HIGH" : "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
        effort: rec.effort,
        stage: bottleneck.stage,
    };
}
