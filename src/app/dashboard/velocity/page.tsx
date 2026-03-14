import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getVelocityData } from './actions';
import VelocityView from './view';

export default async function VelocityPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');
    if (!session.user.organizationId) redirect('/onboarding');

    const data = await getVelocityData();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Velocity</h1>
                <p className="text-gray-500 mt-1">Cadência de experimentos e saúde do motor de growth</p>
            </div>
            <VelocityView data={data} />
        </div>
    );
}
