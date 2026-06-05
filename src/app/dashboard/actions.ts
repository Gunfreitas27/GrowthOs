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
            results: JSON.stringify({}),
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

function buildWeeklyBuckets(start: Date, end: Date) {
    const weeks: { start: Date; end: Date; label: string }[] = [];
    const cursor = new Date(start);
    let weekNum = 1;
    while (cursor < end) {
        const weekEnd = new Date(cursor);
        weekEnd.setDate(cursor.getDate() + 7);
        weeks.push({ start: new Date(cursor), end: weekEnd, label: `S${weekNum}` });
        cursor.setDate(cursor.getDate() + 7);
        weekNum++;
    }
    return weeks;
}

export async function getDashboardData() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");

    const orgId = session.user.organizationId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const [metrics, channels, experiments, learnings] = await Promise.all([
        prisma.metric.findMany({
            where: { organizationId: orgId, date: { gte: ninetyDaysAgo } },
            select: { category: true, value: true, date: true },
            orderBy: { date: 'asc' },
        }),
        prisma.channel.findMany({
            where: { organizationId: orgId },
            include: {
                metrics: { orderBy: { date: 'desc' }, take: 30 },
                spends: { orderBy: { date: 'desc' }, take: 30 },
            },
        }),
        prisma.experiment.findMany({
            where: { organizationId: orgId },
            include: { owner: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        prisma.learning.count({ where: { organizationId: orgId } }),
    ]);

    const weeks = buildWeeklyBuckets(ninetyDaysAgo, now);

    const getMetricsByCategory = (category: string, start: Date, end: Date) =>
        metrics.filter(m => m.category === category && m.date >= start && m.date < end);

    const aggregateValue = (items: { value: number }[], method: 'sum' | 'avg' = 'avg') => {
        if (items.length === 0) return 0;
        const total = items.reduce((s, i) => s + i.value, 0);
        return method === 'sum' ? total : total / items.length;
    };

    const currentAcq = aggregateValue(getMetricsByCategory(MetricCategory.ACQUISITION, thirtyDaysAgo, now));
    const previousAcq = aggregateValue(getMetricsByCategory(MetricCategory.ACQUISITION, sixtyDaysAgo, thirtyDaysAgo));
    const currentAct = aggregateValue(getMetricsByCategory(MetricCategory.ACTIVATION, thirtyDaysAgo, now));
    const previousAct = aggregateValue(getMetricsByCategory(MetricCategory.ACTIVATION, sixtyDaysAgo, thirtyDaysAgo));
    const currentRet = aggregateValue(getMetricsByCategory(MetricCategory.RETENTION, thirtyDaysAgo, now));
    const previousRet = aggregateValue(getMetricsByCategory(MetricCategory.RETENTION, sixtyDaysAgo, thirtyDaysAgo));
    const currentRef = aggregateValue(getMetricsByCategory(MetricCategory.REFERRAL, thirtyDaysAgo, now));
    const previousRef = aggregateValue(getMetricsByCategory(MetricCategory.REFERRAL, sixtyDaysAgo, thirtyDaysAgo));
    const currentRev = aggregateValue(getMetricsByCategory(MetricCategory.REVENUE, thirtyDaysAgo, now), 'sum');
    const previousRev = aggregateValue(getMetricsByCategory(MetricCategory.REVENUE, sixtyDaysAgo, thirtyDaysAgo), 'sum');

    const calcTrend = (cur: number, prev: number) =>
        prev === 0 ? 0 : parseFloat((((cur - prev) / prev) * 100).toFixed(1));

    const sparkline = (category: string) =>
        weeks.map(w => Math.round(aggregateValue(getMetricsByCategory(category, w.start, w.end))));

    // Channel data
    const totalSpend = channels
        .filter(c => c.status === 'ACTIVE')
        .reduce((acc, c) => acc + c.spends.reduce((s, sp) => s + Number(sp.amount), 0), 0);
    const totalRevenue = channels
        .filter(c => c.status === 'ACTIVE')
        .reduce((acc, c) => acc + c.metrics.reduce((s, m) => s + Number(m.revenue || 0), 0), 0);
    const activeChannelCount = channels.filter(c => c.status === 'ACTIVE').length;

    const channelDistribution = channels
        .filter(c => c.status === 'ACTIVE')
        .map((c, i) => ({
            name: c.displayName,
            value: totalSpend > 0
                ? Math.round((c.spends.reduce((s, sp) => s + Number(sp.amount), 0) / totalSpend) * 100)
                : 0,
            color: i === 0 ? '#6B4FE8' : i === 1 ? '#1AD3C5' : i === 2 ? '#F59E0B' : '#A8A3C7',
        }));

    // Funnel data from metrics
    const funnelData = [
        { name: 'Visitantes', value: Math.round(currentAcq), fill: '#6B4FE8' },
        { name: 'Ativação', value: Math.round(currentAct || currentAcq * 0.45), fill: '#8B6FE8' },
        { name: 'Retenção', value: Math.round(currentRet || currentAcq * 0.15), fill: '#1AD3C5' },
        { name: 'Receita', value: Math.round(currentRev), fill: '#059669' },
    ];

    const trendData = weeks.map(w => ({
        week: w.label,
        acquisition: Math.round(aggregateValue(getMetricsByCategory(MetricCategory.ACQUISITION, w.start, w.end))),
        activation: Math.round(aggregateValue(getMetricsByCategory(MetricCategory.ACTIVATION, w.start, w.end))),
        retention: Math.round(aggregateValue(getMetricsByCategory(MetricCategory.RETENTION, w.start, w.end))),
        revenue: Math.round(aggregateValue(getMetricsByCategory(MetricCategory.REVENUE, w.start, w.end), 'sum')),
    }));

    // Velocity stats
    const runningNow = experiments.filter(e => e.status === 'in_progress').length;
    const completed = experiments.filter(e => e.status === 'completed');
    const wins = completed.filter(e => e.result === 'win').length;
    const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;
    const withDuration = completed.filter(e => e.startedAt && e.endedAt);
    const avgCycleTime = withDuration.length > 0
        ? Math.round(withDuration.reduce((acc, e) =>
            acc + (new Date(e.endedAt!).getTime() - new Date(e.startedAt!).getTime()), 0) / withDuration.length / 86400000)
        : 0;

    // Recent experiments for quick view
    const recentExperiments = experiments.slice(0, 5).map(e => ({
        id: e.id,
        title: e.title,
        status: e.status,
        funnelStage: e.funnelStage,
        priorityScore: e.priorityScore || 0,
        result: e.result,
        owner: e.owner ? { name: e.owner.name || '' } : { name: '—' },
        createdAt: e.createdAt,
    }));

    // Recommendations from metrics
    const recommendations: { id: number; title: string; impact: string; stage: string; description: string }[] = [];
    const acqRate = currentAcq > 0 ? (currentAct / currentAcq) * 100 : 0;
    if (acqRate < 50 && currentAcq > 0) {
        recommendations.push({
            id: 1, title: 'Otimizar taxa de ativação',
            impact: 'Alto', stage: 'Activation',
            description: `Apenas ${acqRate.toFixed(0)}% dos visitantes são ativados. Teste formulários mais curtos e onboarding otimizado.`,
        });
    }
    if (currentRet < 0.3 && currentRet > 0) {
        recommendations.push({
            id: 2, title: 'Melhorar retenção de usuários',
            impact: 'Alto', stage: 'Retention',
            description: `Taxa de retenção atual é de ${(currentRet * 100).toFixed(0)}%. Invista em email marketing e reengajamento.`,
        });
    }
    if (activeChannelCount === 0) {
        recommendations.push({
            id: 3, title: 'Conectar canais de marketing',
            impact: 'Médio', stage: 'Acquisition',
            description: 'Nenhum canal de marketing conectado. Conecte Google Ads ou Meta Ads para monitorar performance.',
        });
    }
    if (totalSpend > 0 && totalRevenue / totalSpend < 1) {
        recommendations.push({
            id: 4, title: 'ROAS abaixo de 1x',
            impact: 'Crítico', stage: 'Revenue',
            description: `ROAS atual de ${(totalRevenue / totalSpend).toFixed(2)}x está abaixo do break-even. Revise campanhas e segmentação.`,
        });
    }

    return {
        metrics: {
            acquisition: { value: Math.round(currentAcq), trend: calcTrend(currentAcq, previousAcq), sparkline: sparkline(MetricCategory.ACQUISITION) },
            activation: { value: currentAct > 0 ? parseFloat((currentAct * 100).toFixed(1)) : 0, trend: calcTrend(currentAct, previousAct), sparkline: sparkline(MetricCategory.ACTIVATION) },
            retention: { value: currentRet > 0 ? parseFloat((currentRet * 100).toFixed(1)) : 0, trend: calcTrend(currentRet, previousRet), sparkline: sparkline(MetricCategory.RETENTION) },
            referral: { value: currentRef > 0 ? parseFloat((currentRef * 100).toFixed(1)) : 0, trend: calcTrend(currentRef, previousRef), sparkline: sparkline(MetricCategory.REFERRAL) },
            revenue: { value: Math.round(currentRev), trend: calcTrend(currentRev, previousRev), sparkline: sparkline(MetricCategory.REVENUE) },
        },
        funnelData,
        trendData,
        channelSummary: {
            totalSpend,
            totalRevenue,
            roas: totalSpend > 0 ? parseFloat((totalRevenue / totalSpend).toFixed(2)) : 0,
            topChannel: channelDistribution.sort((a, b) => b.value - a.value)[0]?.name || 'Nenhum',
            channelDistribution,
            activeChannelCount,
        },
        velocityStats: {
            experimentsThisWeek: recentExperiments.filter(e =>
                e.createdAt >= new Date(now.getTime() - 7 * 86400000)).length,
            winRate,
            avgCycleTime,
            runningNow,
            totalLearnings: learnings,
        },
        recentExperiments,
        recommendations,
    };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
