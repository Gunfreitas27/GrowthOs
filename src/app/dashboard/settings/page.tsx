import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsView from './view';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');
    if (!session.user.organizationId) redirect('/onboarding');

    const [org, members] = await Promise.all([
        prisma.organization.findUnique({
            where: { id: session.user.organizationId },
            select: { id: true, name: true, plan: true, createdAt: true },
        }),
        prisma.user.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
    ]);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="velox-heading text-3xl">Configurações</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--velox-mist)' }}>
                    Organização e membros do time
                </p>
            </div>
            <SettingsView org={org} members={members} currentUserId={session.user.id} />
        </div>
    );
}
