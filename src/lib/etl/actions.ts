'use server'

import { auth } from "@/auth";
import { getConnector } from "./registry";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { runSync } from "./service"; // Import the service

export async function connectSource(connectorId: string, config: any) {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error("Unauthorized");
    }

    const connector = getConnector(connectorId);
    if (!connector) {
        throw new Error("Connector not found");
    }

    const isConnected = await connector.connect(config);

    if (isConnected) {
        // Save to DB
        const dataSource = await prisma.dataSource.create({
            data: {
                name: connector.name,
                type: "GOOGLE_ANALYTICS", // Map dynamically in real app
                config: config,
                organizationId: session.user.organizationId,
                status: "ACTIVE",
            }
        });

        // Trigger initial sync
        // In production, this might be a background job (BullMQ / Inngest)
        // For MVP, await it (might be slow) or just fire and forget (but we want to update UI)
        // Let's fire and forget for now, or just let user click Sync.
        // Actually, let's try to run it immediately so dashboard populates.
        try {
            await runSync(dataSource.id);
        } catch (e) {
            console.error("Initial sync failed", e);
        }

        revalidatePath("/dashboard/connectors");
        revalidatePath("/dashboard");
        return { success: true };
    }

    return { success: false, error: "Connection failed" };
}

export async function disconnectSource(sourceId: string) {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error("Unauthorized");
    }

    await prisma.dataSource.delete({
        where: {
            id: sourceId,
            organizationId: session.user.organizationId
        }
    });

    revalidatePath("/dashboard/connectors");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function triggerSync(sourceId: string) {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error("Unauthorized");
    }

    try {
        await runSync(sourceId);
        revalidatePath("/dashboard/connectors");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Sync failed" };
    }
}
