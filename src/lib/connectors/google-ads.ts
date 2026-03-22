import { BaseConnector } from "./base.connector";
import {
  ConnectorCredentials,
  SyncOptions,
  SyncResult,
  DailyMetrics,
  ChannelInfo,
  ConnectorMetrics,
} from "./types";

export class GoogleAdsConnector extends BaseConnector {
  constructor() {
    super(
      "google-ads",
      "Google Ads",
      "Megaphone",
      "Sincronize dados de campanhas, spend, cliques e conversões.",
      "ADS",
    );
  }

  async connect(credentials: ConnectorCredentials): Promise<boolean> {
    return this.runWithErrorHandling(async () => {
      if (!credentials.customerId) {
        throw new Error("Customer ID é obrigatório");
      }

      this.credentials = {
        customerId: credentials.customerId,
        developerToken: credentials.developerToken,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        refreshToken: credentials.refreshToken,
        accessToken: credentials.accessToken,
      };

      const connected = await this.testConnection(this.credentials);
      this.isConnected = connected;
      return connected;
    }, "Connect to Google Ads");
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    return this.runWithErrorHandling(async () => {
      if (!credentials.customerId) return false;

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Em produção:
      // const oauth2 = new GoogleAds({
      //   client_id: credentials.clientId,
      //   client_secret: credentials.clientSecret,
      //   refresh_token: credentials.refreshToken,
      // });
      // const customer = await oauth2.getCustomer(credentials.customerId);
      // return !!customer;

      return !!credentials.customerId;
    }, "Test Google Ads connection");
  }

  async sync(options?: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    return this.runWithErrorHandling(async () => {
      if (!this.isConnected) {
        throw new Error(
          "Connector não está conectado. Chame connect() primeiro.",
        );
      }

      const metrics = await this.fetchMetrics(options);
      this.lastSyncAt = new Date();

      return this.createSyncResult(true, startTime, metrics, errors, warnings);
    }, "Sync Google Ads data");
  }

  async fetchMetrics(options?: SyncOptions): Promise<DailyMetrics[]> {
    const { start, end } = this.getDateRange(options);
    const dates = this.generateDateSequence(start, end);
    const metrics: DailyMetrics[] = [];

    const campaigns = [
      "Search_Brand",
      "Search_Generic",
      "Display_Retargeting",
      "Shopping_Products",
    ];

    for (const date of dates) {
      for (const campaign of campaigns) {
        const campaignMetrics = this.generateCampaignMetrics(date, campaign);
        metrics.push(campaignMetrics);
      }
    }

    return metrics;
  }

  private generateCampaignMetrics(date: Date, campaign: string): DailyMetrics {
    const impressions = Math.floor(Math.random() * 50000) + 10000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.02));
    const spend = clicks * (Math.random() * 2 + 0.5);
    const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));
    const revenue = conversions * (Math.random() * 150 + 50);

    const connectorMetrics: ConnectorMetrics = {
      impressions,
      clicks,
      spend,
      revenue,
      conversions,
      ctr: (clicks / impressions) * 100,
      cpc: spend / clicks,
      cpm: (spend / impressions) * 1000,
      roas: revenue / spend,
      cpl: spend / conversions,
    };

    return {
      date,
      channelId: this.id,
      campaign,
      metrics: connectorMetrics,
    };
  }

  getChannelInfo(): ChannelInfo {
    return {
      id: this.id,
      name: "google-ads",
      displayName: this.name,
      type: this.type,
      icon: this.icon,
      status: this.isConnected ? "ACTIVE" : "DISCONNECTED",
      lastSyncAt: this.lastSyncAt,
    };
  }
}
