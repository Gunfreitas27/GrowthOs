'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const LearningSchema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    summary: z.string().min(1, 'Resumo obrigatório'),
    category: z.enum(['copy', 'ux', 'pricing', 'onboarding', 'activation', 'retention', 'channel', 'other']),
    funnelStage: z.string().optional().nullable(),
    impactLevel: z.enum(['high', 'medium', 'low']).default('medium'),
    resultType: z.enum(['validated', 'invalidated', 'inconclusive']),
    evidence: z.string().optional().nullable(),
    recommendation: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    experimentId: z.string().optional().nullable(),
    isPinned: z.boolean().default(false),
});

export type LearningFormValues = z.infer<typeof LearningSchema>;

type LearningFilters = {
    category?: string;
    impactLevel?: string;
    resultType?: string;
    search?: string;
};

function parseLearning(l: { tags: string; [key: string]: unknown }) {
    return { ...l, tags: JSON.parse(l.tags) as string[] };
}

export async function getLearnings(filters?: LearningFilters) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const where: Record<string, unknown> = { organizationId: session.user.organizationId };
    if (filters?.category && filters.category !== 'all') where.category = filters.category;
    if (filters?.impactLevel && filters.impactLevel !== 'all') where.impactLevel = filters.impactLevel;
    if (filters?.resultType && filters.resultType !== 'all') where.resultType = filters.resultType;
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { summary: { contains: filters.search } },
            { evidence: { contains: filters.search } },
        ];
    }

    const learnings = await prisma.learning.findMany({
        where,
        include: {
            experiment: { select: { id: true, title: true } },
            createdBy: { select: { id: true, name: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return learnings.map(parseLearning);
}

export async function createLearning(data: LearningFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const validated = LearningSchema.parse(data);

    await prisma.learning.create({
        data: {
            title: validated.title,
            summary: validated.summary,
            category: validated.category,
            funnelStage: validated.funnelStage,
            impactLevel: validated.impactLevel,
            resultType: validated.resultType,
            evidence: validated.evidence,
            recommendation: validated.recommendation,
            tags: JSON.stringify(validated.tags),
            experimentId: validated.experimentId,
            isPinned: validated.isPinned,
            createdById: session.user.id,
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/dashboard/learnings');
}

export async function updateLearning(id: string, data: LearningFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const validated = LearningSchema.parse(data);

    await prisma.learning.updateMany({
        where: { id, organizationId: session.user.organizationId },
        data: {
            title: validated.title,
            summary: validated.summary,
            category: validated.category,
            funnelStage: validated.funnelStage,
            impactLevel: validated.impactLevel,
            resultType: validated.resultType,
            evidence: validated.evidence,
            recommendation: validated.recommendation,
            tags: JSON.stringify(validated.tags),
            experimentId: validated.experimentId,
        },
    });

    revalidatePath('/dashboard/learnings');
}

export async function deleteLearning(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.learning.deleteMany({
        where: { id, organizationId: session.user.organizationId },
    });

    revalidatePath('/dashboard/learnings');
}

export async function togglePin(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const current = await prisma.learning.findFirst({
        where: { id, organizationId: session.user.organizationId },
    });
    if (!current) throw new Error('Learning not found');

    await prisma.learning.update({
        where: { id },
        data: { isPinned: !current.isPinned },
    });

    revalidatePath('/dashboard/learnings');
}

export async function getExperimentsForSelect() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    return prisma.experiment.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
    });
}
