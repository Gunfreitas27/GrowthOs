import { MetricCategory } from "@/types/enums";

export interface ForecastParameters {
    acquisitionUplift: number; // e.g. 0.1 for 10%
    activationUplift: number;
    retentionUplift: number;
    referralUplift: number;
    revenueUplift: number;
}

export interface ForecastResult {
    month: number;
    metrics: Record<MetricCategory, number>;
    totalRevenue: number;
}

export function calculateForecast(
    baseline: Record<MetricCategory, number>,
    params: ForecastParameters,
    months: number = 12
): ForecastResult[] {
    const results: ForecastResult[] = [];
    let currentBaseline = { ...baseline };

    for (let m = 1; m <= months; m++) {
        // Apply uplifts to baseline for this month's simulation
        const projected = {
            [MetricCategory.ACQUISITION]: currentBaseline[MetricCategory.ACQUISITION] * (1 + params.acquisitionUplift),
            [MetricCategory.ACTIVATION]: currentBaseline[MetricCategory.ACTIVATION] * (1 + params.activationUplift),
            [MetricCategory.RETENTION]: currentBaseline[MetricCategory.RETENTION] * (1 + params.retentionUplift),
            [MetricCategory.REFERRAL]: currentBaseline[MetricCategory.REFERRAL] * (1 + params.referralUplift),
            [MetricCategory.REVENUE]: currentBaseline[MetricCategory.REVENUE] * (1 + params.revenueUplift),
        };

        // Note: In a more complex model, activation would be a % of acquisition, etc.
        // For the MVP, we apply the uplift directly to the volume of each stage
        // to show the potential impact if that stage is improved by X%.

        results.push({
            month: m,
            metrics: projected,
            totalRevenue: projected[MetricCategory.REVENUE],
        });

        // For simplicity in MVP, we track the same baseline. 
        // Compounding logic could be added here in future iterations.
    }

    return results;
}
