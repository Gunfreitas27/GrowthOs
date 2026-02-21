'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MetricCategory } from "@/types/enums";
import { analyzeFunnel } from "@/lib/diagnosis/analyzer";
import { FunnelStage } from "@/lib/diagnosis/types";

export async function runDiagnosis() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized");
    }

    // Fetch last 30 days of metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = await prisma.metric.findMany({
        where: {
            organizationId: session.user.organizationId,
            date: {
                gte: thirtyDaysAgo,
            }
        }
    });

    // Aggregate by category
    const aggregateByCategory = (category: MetricCategory) => {
        const filtered = metrics.filter(m => m.category === category);
        if (filtered.length === 0) return 0;

        // For REVENUE, sum. For others, average
        if (category === MetricCategory.REVENUE) {
            return filtered.reduce((sum, m) => sum + m.value, 0);
        }

        return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
    };

    // Build funnel stages
    const stages: FunnelStage[] = [
        {
            category: MetricCategory.ACQUISITION,
            value: aggregateByCategory(MetricCategory.ACQUISITION),
        },
        {
            category: MetricCategory.ACTIVATION,
            value: aggregateByCategory(MetricCategory.ACQUISITION) * 0.45, // Mock for now
        },
        {
            category: MetricCategory.RETENTION,
            value: aggregateByCategory(MetricCategory.RETENTION) * 100, // Convert from rate
        },
        {
            category: MetricCategory.REFERRAL,
            value: aggregateByCategory(MetricCategory.ACQUISITION) * 0.15, // Mock
        },
        {
            category: MetricCategory.REVENUE,
            value: aggregateByCategory(MetricCategory.REVENUE),
        },
    ];

    // Run diagnosis
    const diagnosis = analyzeFunnel(stages);

    return diagnosis;
}
