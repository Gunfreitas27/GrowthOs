import { MetricCategory } from "@/types/enums";

export interface MetricInput {
    name: string;
    value: number;
    date: Date;
    category: MetricCategory;
    sourceId?: string;
}

export function mapGoogleAnalyticsData(rawData: Record<string, unknown>[]): MetricInput[] {
    const metrics: MetricInput[] = [];

    rawData.forEach((record) => {
        const date = new Date(record.date as string | number);

        // Map Users -> ACQUISITION
        if (record.users !== undefined) {
            metrics.push({
                name: "users",
                value: record.users as number,
                date: date,
                category: MetricCategory.ACQUISITION,
            });
        }

        // Map Sessions -> ACQUISITION
        if (record.sessions !== undefined) {
            metrics.push({
                name: "sessions",
                value: record.sessions as number,
                date: date,
                category: MetricCategory.ACQUISITION,
            });
        }

        // Map Bounce Rate -> RETENTION
        if (record.bounceRate !== undefined) {
            metrics.push({
                name: "bounce_rate",
                value: record.bounceRate as number,
                date: date,
                category: MetricCategory.RETENTION,
            });
        }

        // Map Revenue -> REVENUE
        if (record.revenue !== undefined) {
            metrics.push({
                name: "revenue",
                value: record.revenue as number,
                date: date,
                category: MetricCategory.REVENUE,
            });
        }
    });

    return metrics;
}
