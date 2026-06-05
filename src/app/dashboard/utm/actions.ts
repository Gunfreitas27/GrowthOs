'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const UtmSchema = z.object({
    baseUrl: z.string().url('URL inválida'),
    source: z.string().min(1, 'Source é obrigatório'),
    medium: z.string().min(1, 'Medium é obrigatório'),
    campaign: z.string().min(1, 'Campaign é obrigatório'),
    term: z.string().optional(),
    content: z.string().optional(),
});

export type UtmFormValues = z.infer<typeof UtmSchema>;

export async function getUtmLinks(search?: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const where: Record<string, unknown> = { organizationId: session.user.organizationId };
    if (search) {
        where.OR = [
            { baseUrl: { contains: search } },
            { campaign: { contains: search } },
            { source: { contains: search } },
        ];
    }

    const links = await prisma.utmLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    return links.map(l => ({
        ...l,
        createdAt: l.createdAt.toISOString().split('T')[0],
    }));
}

export async function createUtmLink(data: UtmFormValues) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    const parsed = UtmSchema.parse(data);

    const link = await prisma.utmLink.create({
        data: {
            baseUrl: parsed.baseUrl,
            source: parsed.source,
            medium: parsed.medium,
            campaign: parsed.campaign,
            term: parsed.term || null,
            content: parsed.content || null,
            shortCode: `utm_${Date.now().toString(36)}`,
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/dashboard/utm');
    return { ...link, createdAt: link.createdAt.toISOString().split('T')[0] };
}

export async function deleteUtmLink(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error('Unauthorized');

    await prisma.utmLink.deleteMany({
        where: { id, organizationId: session.user.organizationId },
    });

    revalidatePath('/dashboard/utm');
}

export async function incrementUtmClicks(id: string) {
    await prisma.utmLink.update({
        where: { id },
        data: { clicks: { increment: 1 } },
    });
}
