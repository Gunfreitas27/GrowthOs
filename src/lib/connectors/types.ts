export interface ConnectorCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  propertyId?: string;
  accountId?: string;
  measurementId?: string;
  viewId?: string;
  adAccountId?: string;
  businessAccountId?: string;
  [key: string]: string | undefined;
}

export interface SyncOptions {
  since?: Date;
  until?: Date;
  dateRange?: {
    start: Date;
    end: Date;
  };
  metrics?: string[];
  dimensions?: string[];
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errors: string[];
  warnings: string[];
  lastSync: Date;
  duration: number;
  data?: unknown[];
}

export interface ConnectorMetrics {
  impressions?: number;
  clicks?: number;
  spend?: number;
  revenue?: number;
  conversions?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  roas?: number;
  cpl?: number;
  ltv?: number;
  bounceRate?: number;
  sessions?: number;
  users?: number;
  pageviews?: number;
  conversionRate?: number;
}

export interface DailyMetrics {
  date: Date;
  channelId: string;
  source?: string;
  campaign?: string;
  adGroup?: string;
  creative?: string;
  country?: string;
  device?: string;
  metrics: ConnectorMetrics;
}

export interface ConnectorHealth {
  isConnected: boolean;
  lastSyncAt?: Date;
  lastError?: string;
  apiQuotaUsed?: number;
  apiQuotaLimit?: number;
  nextSyncAt?: Date;
}

export type ConnectorType =
  | "ANALYTICS"
  | "ADS"
  | "CRM"
  | "EMAIL"
  | "PAYMENT"
  | "SOCIAL"
  | "SEO";

export type ChannelStatus = "ACTIVE" | "PAUSED" | "ERROR" | "DISCONNECTED";

export interface ChannelInfo {
  id: string;
  name: string;
  displayName: string;
  type: ConnectorType;
  icon: string;
  status: ChannelStatus;
  lastSyncAt?: Date;
  metrics?: ConnectorMetrics;
}

export interface AttributionData {
  source: string;
  medium: string;
  campaign?: string;
  channel: string;
  conversions: number;
  conversionValue: number;
  percentage: number;
}
