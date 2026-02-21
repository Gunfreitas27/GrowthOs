import { MetricCategory } from "@/types/enums";

export interface MetricInput {
    name: string;
    value: number;
    date: Date;
    category: MetricCategory;
    sourceId?: string;
}

export function mapGoogleAnalyticsData(rawData: any[]): MetricInput[] {
    const metrics: MetricInput[] = [];

    rawData.forEach((record) => {
        const date = new Date(record.date);

        // Map Users -> ACQUISITION
        if (record.users !== undefined) {
            metrics.push({
                name: "users",
                value: record.users,
                date: date,
                category: MetricCategory.ACQUISITION,
            });
        }

        // Map Sessions -> ACQUISITION
        if (record.sessions !== undefined) {
            metrics.push({
                name: "sessions",
                value: record.sessions,
                date: date,
                category: MetricCategory.ACQUISITION,
            });
        }

        // Map Bounce Rate -> RETENTION (Inverse? Or just store as is)
        // Storing as is for now.
        if (record.bounceRate !== undefined) {
            metrics.push({
                name: "bounce_rate",
                value: record.bounceRate,
                date: date,
                category: MetricCategory.RETENTION,
            });
        }

        // Map Revenue -> REVENUE
        if (record.revenue !== undefined) {
            metrics.push({
                name: "revenue",
                value: record.revenue,
                date: date,
                category: MetricCategory.REVENUE,
            });
        }
    });

    return metrics;
}
