import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ConnectorsList from "./result-list";

export default async function ConnectorsPage() {
    const session = await auth();
    if (!session?.user?.organizationId) return <div>Unauthorized</div>;

    const connectedSources = await prisma.dataSource.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, name: true, config: true } // Select only needed fields
    });

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Data Connectors</h1>
                <p className="text-gray-500">Connect your data sources to start analyzing.</p>
            </div>
            <ConnectorsList connectedSources={connectedSources} />
        </div>
    );
}
