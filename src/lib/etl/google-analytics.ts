import { Connector, ConnectorConfig, SyncResult } from "./types";

export class GoogleAnalyticsConnector implements Connector {
    id = "google-analytics";
    name = "Google Analytics 4";
    icon = "Activity"; // Lucide icon name
    description = "Connect your GA4 property to sync traffic and conversion data.";
    type = "ANALYTICS" as const;

    async connect(config: ConnectorConfig): Promise<boolean> {
        // Mock connection delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!config.propertyId) {
            throw new Error("Property ID is required");
        }

        return true;
    }

    async disconnect(): Promise<boolean> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
    }

    async testConnection(config: ConnectorConfig): Promise<boolean> {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return !!config.propertyId;
    }

    async sync(since?: Date): Promise<SyncResult> {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work

        // Generate mock daily data for the last 30 days
        const data = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toISOString().split('T')[0],
                users: Math.floor(Math.random() * 1000) + 500,
                sessions: Math.floor(Math.random() * 1500) + 600,
                bounceRate: Math.random() * 0.4 + 0.3,
                conversions: Math.floor(Math.random() * 50) + 10,
                revenue: Math.floor(Math.random() * 5000) + 1000,
                source: 'organic',
            });
        }

        return {
            success: true,
            recordsProcessed: data.length,
            lastSync: new Date(),
            data: data
        }
    }
}
