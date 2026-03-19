import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardView from "./view";
import { getTeamSummary } from "./actions";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!session.user.organizationId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { organization: true }
        });

        if (!user?.organizationId) {
            redirect("/onboarding");
        }
    }

    const teamSummary = await getTeamSummary();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="velox-heading text-3xl">Your growth at a glance.</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--velox-mist)' }}>
                    {session.user.name || session.user.email}
                </p>
            </div>
            <DashboardView teamSummary={teamSummary} />
        </div>
    );
}
