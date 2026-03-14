'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculatePriorityScore } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ExperimentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    hypothesis: z.string().optional().nullable(),
    funnelStage: z.enum(['awareness', 'acquisition', 'activation', 'retention', 'revenue', 'referral']),
    status: z.enum(['idea', 'backlog', 'in_progress', 'paused', 'completed', 'archived']).default('idea'),
    iceImpact: z.number().min(1).max(10).optional().nullable(),
    iceConfidence: z.number().min(1).max(10).optional().nullable(),
    iceEase: z.number().min(1).max(10).optional().nullable(),
    riceReach: z.number().min(0).optional().nullable(),
    riceImpact: z.number().min(1).max(3).optional().nullable(),
    riceConfidence: z.number().min(0).max(100).optional().nullable(),
    riceEffort: z.number().min(0.1).optional().nullable(),
    ownerId: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    relatedMetric: z.string().optional().nullable(),
    expectedLift: z.number().optional().nullable(),
    actualLift: z.number().optional().nullable(),
    result: z.enum(['win', 'loss', 'inconclusive']).optional().nullable(),
    learning: z.string().optional().nullable(),
});

export type ExperimentFormValues = z.infer<typeof ExperimentSchema>;

type ExperimentFilters = {
    funnelStage?: string;
    ownerId?: string;
    status?: string;
};

function parseExperiment(e: { tags: string; [key: string]: unknown }) {
    return { ...e, tags: JSON.parse(e.tags) as string[] };
}

export async function getExperiments(filters?: ExperimentFilters) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const where: Record<string, unknown> = { organizationId: session.user.organizationId };
    if (filters?.funnelStage && filters.funnelStage !== 'all') where.funnelStage = filters.funnelStage;
    if (filters?.ownerId && filters.ownerId !== 'all') where.ownerId = filters.ownerId;
    if (filters?.status) where.status = filters.status;

    const experiments = await prisma.experiment.findMany({
        where,
        include: { owner: { select: { id: true, name: true } } },
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'desc' }],
    });

    return experiments.map(parseExperiment);
}

export async function createExperiment(data: ExperimentFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const validated = ExperimentSchema.parse(data);
    const priorityScore = calculatePriorityScore(
        { iceImpact: validated.iceImpact ?? undefined, iceConfidence: validated.iceConfidence ?? undefined, iceEase: validated.iceEase ?? undefined },
        { riceReach: validated.riceReach ?? undefined, riceImpact: validated.riceImpact ?? undefined, riceConfidence: validated.riceConfidence ?? undefined, riceEffort: validated.riceEffort ?? undefined },
    );

    const startedAt = validated.status === 'in_progress' ? new Date() : null;
    const endedAt = (validated.status === 'completed' || validated.status === 'archived') ? new Date() : null;

    await prisma.experiment.create({
        data: {
            title: validated.title,
            description: validated.description,
            hypothesis: validated.hypothesis,
            funnelStage: validated.funnelStage,
            status: validated.status,
            priorityScore,
            iceImpact: validated.iceImpact,
            iceConfidence: validated.iceConfidence,
            iceEase: validated.iceEase,
            riceReach: validated.riceReach,
            riceImpact: validated.riceImpact,
            riceConfidence: validated.riceConfidence,
            riceEffort: validated.riceEffort,
            ownerId: validated.ownerId,
            organizationId: session.user.organizationId,
            tags: JSON.stringify(validated.tags),
            relatedMetric: validated.relatedMetric,
            expectedLift: validated.expectedLift,
            actualLift: validated.actualLift,
            result: validated.result,
            learning: validated.learning,
            startedAt,
            endedAt,
        },
    });

    revalidatePath('/dashboard/experiments');
}

export async function updateExperiment(id: string, data: ExperimentFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const validated = ExperimentSchema.parse(data);
    const priorityScore = calculatePriorityScore(
        { iceImpact: validated.iceImpact ?? undefined, iceConfidence: validated.iceConfidence ?? undefined, iceEase: validated.iceEase ?? undefined },
        { riceReach: validated.riceReach ?? undefined, riceImpact: validated.riceImpact ?? undefined, riceConfidence: validated.riceConfidence ?? undefined, riceEffort: validated.riceEffort ?? undefined },
    );

    const current = await prisma.experiment.findFirst({ where: { id, organizationId: session.user.organizationId } });
    if (!current) throw new Error('Experiment not found');

    let startedAt = current.startedAt;
    let endedAt = current.endedAt;
    if (validated.status === 'in_progress' && !startedAt) startedAt = new Date();
    if ((validated.status === 'completed' || validated.status === 'archived') && !endedAt) endedAt = new Date();

    await prisma.experiment.update({
        where: { id },
        data: {
            title: validated.title,
            description: validated.description,
            hypothesis: validated.hypothesis,
            funnelStage: validated.funnelStage,
            status: validated.status,
            priorityScore,
            iceImpact: validated.iceImpact,
            iceConfidence: validated.iceConfidence,
            iceEase: validated.iceEase,
            riceReach: validated.riceReach,
            riceImpact: validated.riceImpact,
            riceConfidence: validated.riceConfidence,
            riceEffort: validated.riceEffort,
            ownerId: validated.ownerId,
            tags: JSON.stringify(validated.tags),
            relatedMetric: validated.relatedMetric,
            expectedLift: validated.expectedLift,
            actualLift: validated.actualLift,
            result: validated.result,
            learning: validated.learning,
            startedAt,
            endedAt,
        },
    });

    revalidatePath('/dashboard/experiments');
}

export async function updateExperimentStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const current = await prisma.experiment.findFirst({ where: { id, organizationId: session.user.organizationId } });
    if (!current) throw new Error('Experiment not found');

    let startedAt = current.startedAt;
    let endedAt = current.endedAt;
    if (status === 'in_progress' && !startedAt) startedAt = new Date();
    if ((status === 'completed' || status === 'archived') && !endedAt) endedAt = new Date();

    await prisma.experiment.update({ where: { id }, data: { status, startedAt, endedAt } });
    revalidatePath('/dashboard/experiments');
}

export async function deleteExperiment(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.experiment.update({
        where: { id, organizationId: session.user.organizationId } as Record<string, unknown>,
        data: { status: 'archived' },
    });

    revalidatePath('/dashboard/experiments');
}
