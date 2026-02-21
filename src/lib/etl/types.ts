export interface ConnectorConfig {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    accountId?: string;
    [key: string]: any;
}

export interface SyncResult {
    success: boolean;
    recordsProcessed: number;
    errors?: string[];
    lastSync?: Date;
    data?: any[]; // Raw data records for mapping
}

export interface Connector {
    id: string; // "google-analytics", "hubspot", etc.
    name: string;
    icon: string;
    description: string;
    type: "ANALYTICS" | "ADS" | "CRM" | "PAYMENT";

    // Methods
    connect(config: ConnectorConfig): Promise<boolean>;
    disconnect(): Promise<boolean>;
    testConnection(config: ConnectorConfig): Promise<boolean>;
    sync(since?: Date): Promise<SyncResult>;
}
