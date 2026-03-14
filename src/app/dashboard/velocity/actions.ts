'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const FUNNEL_STAGES = ['awareness', 'acquisition', 'activation', 'retention', 'revenue', 'referral'] as const;

function buildWeeklyChart(
    experiments: { createdAt: Date }[],
    weeksBack: number,
): { week: string; count: number }[] {
    const now = new Date();
    return Array.from({ length: weeksBack }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (weeksBack - i) * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        const count = experiments.filter(
            e => new Date(e.createdAt) >= weekStart && new Date(e.createdAt) < weekEnd,
        ).length;
        // Label: "Sem N" where N counts from oldest
        const label = `S${i + 1}`;
        return { week: label, count };
    });
}

export async function getVelocityData() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');
    const orgId = session.user.organizationId;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [allExperiments, totalLearnings] = await Promise.all([
        prisma.experiment.findMany({
            where: { organizationId: orgId },
            select: {
                id: true, title: true, status: true, result: true, funnelStage: true,
                startedAt: true, endedAt: true, updatedAt: true, createdAt: true,
            },
        }),
        prisma.learning.count({ where: { organizationId: orgId } }),
    ]);

    // KPIs
    const runningNow = allExperiments.filter(e => e.status === 'in_progress').length;

    const completedRecently = allExperiments.filter(
        e => e.status === 'completed' && e.endedAt && new Date(e.endedAt) >= thirtyDaysAgo,
    ).length;

    const completed = allExperiments.filter(e => e.status === 'completed');
    const wins = completed.filter(e => e.result === 'win').length;
    const winRateAllTime = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;

    const recentCompleted = completed.filter(e => e.endedAt && new Date(e.endedAt) >= thirtyDaysAgo);
    const recentWins = recentCompleted.filter(e => e.result === 'win').length;
    const winRate30d = recentCompleted.length > 0 ? Math.round((recentWins / recentCompleted.length) * 100) : 0;

    const withDuration = completed.filter(e => e.startedAt && e.endedAt);
    const avgDurationDays = withDuration.length > 0
        ? Math.round(
            withDuration.reduce(
                (acc, e) => acc + (new Date(e.endedAt!).getTime() - new Date(e.startedAt!).getTime()),
                0,
            ) / withDuration.length / 86400000,
        )
        : 0;

    const stageCounts = allExperiments.reduce<Record<string, number>>((acc, e) => {
        acc[e.funnelStage] = (acc[e.funnelStage] || 0) + 1;
        return acc;
    }, {});

    const topFunnelStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    const ideasInBacklog = allExperiments.filter(e => e.status === 'idea' || e.status === 'backlog').length;

    // Weekly chart (last 12 weeks)
    const weeklyData = buildWeeklyChart(
        allExperiments.map(e => ({ createdAt: new Date(e.createdAt) })),
        12,
    );

    // Per-stage breakdown
    const funnelStageBreakdown = FUNNEL_STAGES.map(stage => ({
        stage,
        count: stageCounts[stage] ?? 0,
    }));

    // Stale: in_progress and updatedAt > 30 days ago
    const staleExperiments = allExperiments
        .filter(e => e.status === 'in_progress' && new Date(e.updatedAt) < thirtyDaysAgo)
        .map(e => ({
            id: e.id,
            title: e.title,
            funnelStage: e.funnelStage,
            updatedAt: e.updatedAt,
            daysSinceUpdate: Math.floor(
                (now.getTime() - new Date(e.updatedAt).getTime()) / 86400000,
            ),
        }));

    return {
        kpis: {
            runningNow,
            completedRecently,
            winRateAllTime,
            winRate30d,
            avgDurationDays,
            topFunnelStage,
            ideasInBacklog,
            totalLearnings,
        },
        weeklyData,
        funnelStageBreakdown,
        staleExperiments,
    };
}

export type VelocityData = Awaited<ReturnType<typeof getVelocityData>>;
