'use server';

import { connectSource as connect, disconnectSource as disconnect } from "@/lib/etl/actions";

export async function connectSource(id: string, config: any) {
    return connect(id, config);
}

export async function disconnectSource(id: string) {
    return disconnect(id);
}
