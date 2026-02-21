'use client'

import { AVAILABLE_CONNECTORS } from "@/lib/etl/registry";
import { Connector } from "@/lib/etl/types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { connectSource, disconnectSource } from "./actions"; // We'll move server actions to a separate file or use the ones we made
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock typings for now since we can't import server types directly in client sometimes easily without type-only imports
type ConnectedSource = {
    id: string;
    name: string;
    config: any;
};

export default function ConnectorsList({ connectedSources }: { connectedSources: ConnectedSource[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleConnect = async (connectorId: string, formData: FormData) => {
        setLoading(true);
        try {
            const config = { propertyId: formData.get('propertyId') };
            await connectSource(connectorId, config);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to connect");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async (sourceId: string) => {
        if (!confirm("Are you sure?")) return;
        setLoading(true);
        try {
            await disconnectSource(sourceId);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_CONNECTORS.map((connector: any) => {
                const source = connectedSources.find((s) => s.name === connector.name);
                const isConnected = !!source;

                return (
                    <Card key={connector.id} className={isConnected ? "border-green-500" : ""}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {connector.name}
                            </CardTitle>
                            <CardDescription>{connector.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            {isConnected ? (
                                <Button variant="outline"
                                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDisconnect(source.id)}
                                    disabled={loading}>
                                    {loading ? 'Processing...' : 'Disconnect'}
                                </Button>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full">Connect</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Connect {connector.name}</DialogTitle>
                                            <DialogDescription>
                                                Enter your configuration details below.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form action={(formData) => handleConnect(connector.id, formData)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="propertyId" className="text-right">Property ID</Label>
                                                    <Input id="propertyId" name="propertyId" className="col-span-3" required />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={loading}>
                                                    {loading ? 'Connecting...' : 'Save connection'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
