'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MetricCategory } from "@/types/enums";
import { calculateForecast, ForecastParameters } from "@/lib/forecast";

export async function getTeamSummary() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");
    const orgId = session.user.organizationId;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    type ExpRow = {
        id: string; title: string; status: string; result: string | null;
        funnelStage: string; updatedAt: Date; endedAt: Date | null;
        owner: { name: string | null } | null;
    };
    type LearningRow = {
        id: string; title: string; resultType: string; impactLevel: string;
    };

    const [experimentsRaw, learningsRaw] = await Promise.all([
        prisma.experiment.findMany({
            where: { organizationId: orgId },
            select: {
                id: true, title: true, status: true, result: true,
                funnelStage: true, updatedAt: true, endedAt: true,
                owner: { select: { name: true } },
            },
        }),
        prisma.learning.findMany({
            where: { organizationId: orgId, createdAt: { gte: sevenDaysAgo } },
            select: { id: true, title: true, resultType: true, impactLevel: true },
            orderBy: { createdAt: 'desc' },
            take: 3,
        }),
    ]);

    const experiments = experimentsRaw as ExpRow[];
    const recentLearnings = learningsRaw as LearningRow[];

    const inProgress = experiments.filter((e: ExpRow) => e.status === 'in_progress');
    const completed = experiments.filter((e: ExpRow) => e.status === 'completed');
    const completedThisMonth = completed.filter(
        (e: ExpRow) => e.endedAt && new Date(e.endedAt) >= thirtyDaysAgo,
    );
    const winsThisMonth = completedThisMonth.filter((e: ExpRow) => e.result === 'win');
    const stale = inProgress.filter((e: ExpRow) => new Date(e.updatedAt) < thirtyDaysAgo);

    return {
        activeExperiments: inProgress.length,
        completedThisMonth: completedThisMonth.length,
        winsThisMonth: winsThisMonth.length,
        staleCount: stale.length,
        backlogCount: experiments.filter((e: ExpRow) => e.status === 'backlog').length,
        ideasCount: experiments.filter((e: ExpRow) => e.status === 'idea').length,
        totalExperiments: experiments.length,
        recentLearnings: recentLearnings.map((l: LearningRow) => ({
            id: l.id, title: l.title, resultType: l.resultType, impactLevel: l.impactLevel,
        })),
        recentWins: winsThisMonth.slice(0, 3).map((e: ExpRow) => ({
            id: e.id, title: e.title, funnelStage: e.funnelStage,
        })),
        inProgressExperiments: inProgress.slice(0, 4).map((e: ExpRow) => ({
            id: e.id, title: e.title, funnelStage: e.funnelStage,
            ownerName: e.owner?.name ?? null,
            daysSinceUpdate: Math.floor(
                (now.getTime() - new Date(e.updatedAt).getTime()) / 86400000,
            ),
        })),
    };
}

export type TeamSummary = Awaited<ReturnType<typeof getTeamSummary>>;

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

    return scenarios.map((s: { parameters: string; results: string; [key: string]: unknown }) => ({
        ...s,
        parameters: JSON.parse(s.parameters) as ForecastParameters,
        results: JSON.parse(s.results) as Record<string, unknown>,
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

    // Fetch metrics for last 30 days
    const currentMetrics = await prisma.metric.findMany({
        where: {
            organizationId: session.user.organizationId,
            date: {
                gte: thirtyDaysAgo,
            }
        },
        orderBy: { date: 'desc' }
    });

    // Fetch previous 30 days for trend calculation
    const previousMetrics = await prisma.metric.findMany({
        where: {
            organizationId: session.user.organizationId,
            date: {
                gte: sixtyDaysAgo,
                lt: thirtyDaysAgo,
            }
        }
    });

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
