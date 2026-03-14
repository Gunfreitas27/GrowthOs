import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LearningsView from './view';

export default async function LearningsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');
    if (!session.user.organizationId) redirect('/onboarding');

    const [learnings, experiments] = await Promise.all([
        prisma.learning.findMany({
            where: { organizationId: session.user.organizationId },
            include: {
                experiment: { select: { id: true, title: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.experiment.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, title: true },
            orderBy: { title: 'asc' },
        }),
    ]);

    const parsed = learnings.map(l => ({ ...l, tags: JSON.parse(l.tags) as string[] }));

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Learnings</h1>
                <p className="text-gray-500 mt-1">Repositório de aprendizados de growth da sua equipe</p>
            </div>
            <LearningsView initialLearnings={parsed} experiments={experiments} />
        </div>
    );
}
