'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const FunnelStageDefSchema = z.object({
    name: z.string().min(1),
    order: z.number(),
    description: z.string().optional(),
});

const FunnelSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    description: z.string().optional().nullable(),
    stages: z.array(FunnelStageDefSchema).min(1, 'Adicione pelo menos 1 etapa'),
});

const SnapshotStageSchema = z.object({
    stageName: z.string(),
    value: z.number(),
    unit: z.string().optional(),
});

const SnapshotSchema = z.object({
    snapshotDate: z.string(),
    stageData: z.array(SnapshotStageSchema),
    notes: z.string().optional().nullable(),
});

export type FunnelFormValues = z.infer<typeof FunnelSchema>;
export type SnapshotFormValues = z.infer<typeof SnapshotSchema>;

type StageDef = { name: string; order: number; description?: string };
type SnapshotStage = { stageName: string; value: number; unit?: string };

function parseFunnel(f: { stages: string; [key: string]: unknown }) {
    return { ...f, stages: JSON.parse(f.stages) as StageDef[] };
}

function parseSnapshot(s: { stageData: string; [key: string]: unknown }) {
    return { ...s, stageData: JSON.parse(s.stageData) as SnapshotStage[] };
}

export async function getFunnels() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const funnels = await prisma.funnel.findMany({
        where: { organizationId: session.user.organizationId },
        include: { _count: { select: { snapshots: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return funnels.map(parseFunnel);
}

export async function getFunnel(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const funnel = await prisma.funnel.findFirst({
        where: { id, organizationId: session.user.organizationId },
        include: {
            snapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 20,
                include: { createdBy: { select: { id: true, name: true } } },
            },
            stageLinks: {
                include: { experiment: { select: { id: true, title: true, status: true, funnelStage: true, priorityScore: true } } },
            },
        },
    });

    if (!funnel) return null;

    return {
        ...parseFunnel(funnel),
        snapshots: funnel.snapshots.map(parseSnapshot),
        stageLinks: funnel.stageLinks,
    };
}

export async function createFunnel(data: FunnelFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const validated = FunnelSchema.parse(data);

    await prisma.funnel.create({
        data: {
            name: validated.name,
            description: validated.description,
            stages: JSON.stringify(validated.stages),
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/dashboard/funnels');
}

export async function deleteFunnel(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.funnel.delete({
        where: { id, organizationId: session.user.organizationId } as Record<string, unknown>,
    });

    revalidatePath('/dashboard/funnels');
}

export async function createSnapshot(funnelId: string, data: SnapshotFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const funnel = await prisma.funnel.findFirst({
        where: { id: funnelId, organizationId: session.user.organizationId },
    });
    if (!funnel) throw new Error('Funnel not found');

    const validated = SnapshotSchema.parse(data);

    await prisma.funnelSnapshot.create({
        data: {
            funnelId,
            snapshotDate: new Date(validated.snapshotDate),
            stageData: JSON.stringify(validated.stageData),
            notes: validated.notes,
            createdById: session.user.id,
        },
    });

    revalidatePath('/dashboard/funnels');
}

export async function getExperimentsForFunnel() {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const experiments = await prisma.experiment.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, title: true, status: true, funnelStage: true },
        orderBy: { title: 'asc' },
    });

    return experiments;
}

export async function linkExperimentToStage(funnelId: string, experimentId: string, stageName: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.funnelStageLink.upsert({
        where: { funnelId_experimentId: { funnelId, experimentId } },
        update: { stageName },
        create: { funnelId, experimentId, stageName },
    });

    revalidatePath('/dashboard/funnels');
}

export async function unlinkExperiment(funnelId: string, experimentId: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.funnelStageLink.delete({
        where: { funnelId_experimentId: { funnelId, experimentId } },
    });

    revalidatePath('/dashboard/funnels');
}
