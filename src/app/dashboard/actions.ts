'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MetricCategory } from "@/types/enums";
import { calculateForecast, ForecastParameters } from "@/lib/forecast";

export async function saveScenario(name: string, description: string | null, params: ForecastParameters) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");

    return await prisma.scenario.create({
        data: {
            name,
            description,
            parameters: JSON.stringify(params),
            results: JSON.stringify({}), // Results can be calculated on fly or stored
            organizationId: session.user.organizationId,
        }
    });
}

export async function getScenarios() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");

    const scenarios = await prisma.scenario.findMany({
        where: { organizationId: session.user.organizationId },
        orderBy: { createdAt: 'desc' }
    });

    return scenarios.map(s => ({
        ...s,
        parameters: JSON.parse(s.parameters) as ForecastParameters,
        results: JSON.parse(s.results)
    }));
}

export async function deleteScenario(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");

    return await prisma.scenario.delete({
        where: { id, organizationId: session.user.organizationId }
    });
}

export async function getDashboardMetrics(timeRange: string = "last30d") {
    const session = await auth();
    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized");
    }

    // Calculate date range
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Fetch both periods in parallel, selecting only needed fields
    const [currentMetrics, previousMetrics] = await Promise.all([
        prisma.metric.findMany({
            where: {
                organizationId: session.user.organizationId,
                date: { gte: thirtyDaysAgo },
            },
            select: { category: true, value: true },
        }),
        prisma.metric.findMany({
            where: {
                organizationId: session.user.organizationId,
                date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
            select: { category: true, value: true },
        }),
    ]);

    // Aggregate by category
    const aggregateByCategory = (metrics: any[], category: MetricCategory) => {
        const filtered = metrics.filter(m => m.category === category);
        if (filtered.length === 0) return 0;

        // For REVENUE, sum. For others, average or latest.
        if (category === MetricCategory.REVENUE) {
            return filtered.reduce((sum, m) => sum + m.value, 0);
        }

        // Average for rates/percentages
        return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
    };

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const currentAcq = aggregateByCategory(currentMetrics, MetricCategory.ACQUISITION);
    const previousAcq = aggregateByCategory(previousMetrics, MetricCategory.ACQUISITION);

    const currentRet = aggregateByCategory(currentMetrics, MetricCategory.RETENTION);
    const previousRet = aggregateByCategory(previousMetrics, MetricCategory.RETENTION);

    const currentRev = aggregateByCategory(currentMetrics, MetricCategory.REVENUE);
    const previousRev = aggregateByCategory(previousMetrics, MetricCategory.REVENUE);

    // Build funnel data (simplified - just show totals)
    const funnelData = [
        { name: 'Acquisition', value: Math.round(currentAcq) },
        { name: 'Activation', value: Math.round(currentAcq * 0.45) }, // Mock activation rate
        { name: 'Retention', value: Math.round(currentAcq * 0.15) },
        { name: 'Revenue', value: Math.round(currentRev) },
    ];

    return {
        acquisition: {
            value: Math.round(currentAcq),
            trend: parseFloat(calculateTrend(currentAcq, previousAcq).toFixed(1))
        },
        activation: {
            value: 45.2,
            unit: "%",
            trend: -2.1 // Still mock for now
        },
        retention: {
            value: parseFloat((currentRet * 100).toFixed(1)),
            unit: "%",
            trend: parseFloat(calculateTrend(currentRet, previousRet).toFixed(1))
        },
        referral: {
            value: 15.0,
            unit: "%",
            trend: +0.8 // Still mock
        },
        revenue: {
            value: Math.round(currentRev),
            unit: "USD",
            trend: parseFloat(calculateTrend(currentRev, previousRev).toFixed(1))
        },

        funnelData: funnelData
    };
}
