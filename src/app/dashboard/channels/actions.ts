'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getChannels() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');
    const orgId = session.user.organizationId;

    const channels = await prisma.channel.findMany({
        where: { organizationId: orgId },
        include: {
            metrics: {
                orderBy: { date: 'desc' },
                take: 30,
            },
            spends: {
                orderBy: { date: 'desc' },
                take: 30,
            },
        },
    });

    return channels.map(ch => {
        const latestMetrics = ch.metrics[0];
        const aggregated = ch.metrics.reduce(
            (acc, m) => ({
                impressions: (acc.impressions || 0) + (m.impressions || 0),
                clicks: (acc.clicks || 0) + (m.clicks || 0),
                spend: (acc.spend || 0) + Number(m.spend || 0),
                revenue: (acc.revenue || 0) + Number(m.revenue || 0),
                conversions: (acc.conversions || 0) + (m.conversions || 0),
            }),
            {} as Record<string, number>,
        );

        const totalSpend = ch.spends.reduce((acc, s) => acc + Number(s.amount), 0);

        return {
            id: ch.id,
            connectorType: ch.connectorType,
            displayName: ch.displayName,
            status: ch.status,
            lastSyncAt: ch.lastSyncAt?.toISOString() || null,
            metrics: {
                impressions: aggregated.impressions || latestMetrics?.impressions || 0,
                clicks: aggregated.clicks || latestMetrics?.clicks || 0,
                spend: totalSpend || aggregated.spend || 0,
                revenue: aggregated.revenue || 0,
                conversions: aggregated.conversions || latestMetrics?.conversions || 0,
                roas: aggregated.spend > 0 ? +(aggregated.revenue / aggregated.spend).toFixed(2) : 0,
                ctr: latestMetrics?.ctr ? Number(latestMetrics.ctr) : 0,
                cpc: latestMetrics?.cpc ? Number(latestMetrics.cpc) : 0,
                cpm: latestMetrics?.cpm ? Number(latestMetrics.cpm) : 0,
                users: latestMetrics?.users || 0,
                sessions: latestMetrics?.sessions || 0,
            },
            dailyMetrics: ch.metrics.reverse().map(m => ({
                date: m.date.toISOString().split('T')[0],
                impressions: m.impressions || 0,
                clicks: m.clicks || 0,
                spend: Number(m.spend || 0),
                revenue: Number(m.revenue || 0),
                conversions: m.conversions || 0,
            })),
            spends: ch.spends.reverse().map(s => ({
                date: s.date.toISOString().split('T')[0],
                amount: Number(s.amount),
                campaign: s.campaignName || '',
            })),
        };
    });
}

export type ChannelData = Awaited<ReturnType<typeof getChannels>>[number];

export async function syncChannel(channelId: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.channel.update({
        where: { id: channelId },
        data: { lastSyncAt: new Date() },
    });

    return { success: true };
}

export async function connectChannel(connectorType: string, displayName: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const existing = await prisma.channel.findFirst({
        where: { connectorType, organizationId: session.user.organizationId },
    });

    if (existing) {
        await prisma.channel.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE' },
        });
        return existing;
    }

    const channel = await prisma.channel.create({
        data: {
            connectorType,
            displayName,
            status: 'ACTIVE',
            organizationId: session.user.organizationId,
        },
    });

    return channel;
}

export async function disconnectChannel(channelId: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.channel.update({
        where: { id: channelId, organizationId: session.user.organizationId },
        data: { status: 'DISCONNECTED' },
    });

    return { success: true };
}
