import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ExperimentsView from './view';

export default async function ExperimentsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');
    if (!session.user.organizationId) redirect('/onboarding');

    const [experiments, users] = await Promise.all([
        prisma.experiment.findMany({
            where: { organizationId: session.user.organizationId },
            include: { owner: { select: { id: true, name: true } } },
            orderBy: [{ priorityScore: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.user.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true },
        }),
    ]);

    const parsed = experiments.map(e => ({ ...e, tags: JSON.parse(e.tags) as string[] }));

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Experiments</h1>
                <p className="text-gray-500 mt-1">Gerencie e priorize seus experimentos de growth com scoring ICE/RICE</p>
            </div>
            <ExperimentsView initialExperiments={parsed} users={users} />
        </div>
    );
}
