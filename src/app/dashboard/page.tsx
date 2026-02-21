import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardView from "./view";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Check if user has an organization
    // The session might be stale, so fetch from DB or trust session if configured correctly
    // We added callback to session, so session.user.organizationId should be there
    // But if it's null, we check DB to be sure or redirect

    if (!session.user.organizationId) {
        // Double check DB
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { organization: true }
        });

        if (!user?.organizationId) {
            redirect("/onboarding");
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="mb-8 text-gray-500">Welcome back, {session.user.name || session.user.email}</p>
            <DashboardView />
        </div>
    );
}
