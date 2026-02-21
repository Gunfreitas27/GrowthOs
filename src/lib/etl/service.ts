import { prisma } from "@/lib/prisma";
import { getConnector } from "./registry";
import { SyncResult } from "./types";
import { mapGoogleAnalyticsData } from "./mapper";

export async function runSync(dataSourceId: string): Promise<SyncResult> {
    const dataSource = await prisma.dataSource.findUnique({
        where: { id: dataSourceId },
    });

    if (!dataSource) {
        throw new Error("DataSource not found");
    }

    // Find connector implementation
    // In real app, map type to ID correctly. Here we assume GA.
    const connectorId = dataSource.type === "GOOGLE_ANALYTICS" ? "google-analytics" : "unknown";
    const connector = getConnector(connectorId);

    if (!connector) {
        return { success: false, errors: ["Connector implementation not found"], recordsProcessed: 0 };
    }

    try {
        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: { status: "SYNCING" }
        });

        const result = await connector.sync(dataSource.lastSyncAt || undefined);

        if (result.success && result.data) {
            // Map data (assumed GA for now)
            const metrics = mapGoogleAnalyticsData(result.data);

            await prisma.$transaction(async (tx) => {
                for (const m of metrics) {
                    await tx.metric.create({
                        data: {
                            name: m.name,
                            value: m.value,
                            date: m.date,
                            category: m.category,
                            organizationId: dataSource.organizationId,
                            sourceId: dataSource.id,
                        }
                    });
                }

                await tx.dataSource.update({
                    where: { id: dataSourceId },
                    data: {
                        status: "ACTIVE",
                        lastSyncAt: new Date(),
                    }
                });
            });
        } else {
            await prisma.dataSource.update({
                where: { id: dataSourceId },
                data: {
                    status: result.success ? "ACTIVE" : "ERROR",
                    lastSyncAt: new Date(),
                }
            });
        }

        return result;

    } catch (error) {
        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: { status: "ERROR" }
        });
        return { success: false, errors: [(error as Error).message], recordsProcessed: 0 };
    }
}
