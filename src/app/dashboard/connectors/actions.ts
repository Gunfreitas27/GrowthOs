'use server';

import { connectSource as connect, disconnectSource as disconnect } from "@/lib/etl/actions";
import type { ConnectorConfig } from "@/lib/etl/types";

export async function connectSource(id: string, config: ConnectorConfig) {
    return connect(id, config);
}

export async function disconnectSource(id: string) {
    return disconnect(id);
}
