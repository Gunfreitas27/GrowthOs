import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FunnelsView from './view';

export default async function FunnelsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');
    if (!session.user.organizationId) redirect('/onboarding');

    const funnels = await prisma.funnel.findMany({
        where: { organizationId: session.user.organizationId },
        include: { _count: { select: { snapshots: true } } },
        orderBy: { createdAt: 'desc' },
    });

    const parsed = funnels.map(f => ({
        ...f,
        stages: JSON.parse(f.stages) as { name: string; order: number; description?: string }[],
    }));

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Funnels</h1>
                <p className="text-gray-500 mt-1">Monitore seus funis customizados e identifique gargalos de conversão</p>
            </div>
            <FunnelsView initialFunnels={parsed} />
        </div>
    );
}
