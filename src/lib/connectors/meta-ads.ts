import { BaseConnector } from "./base.connector";
import {
  ConnectorCredentials,
  SyncOptions,
  SyncResult,
  DailyMetrics,
  ChannelInfo,
  ConnectorMetrics,
} from "./types";

export class MetaAdsConnector extends BaseConnector {
  constructor() {
    super(
      "meta-ads",
      "Meta Ads",
      "Facebook",
      "Sincronize campanhas do Facebook e Instagram com resultados detalhados.",
      "ADS",
    );
  }

  async connect(credentials: ConnectorCredentials): Promise<boolean> {
    return this.runWithErrorHandling(async () => {
      if (!credentials.adAccountId) {
        throw new Error("Ad Account ID é obrigatório");
      }

      this.credentials = {
        adAccountId: credentials.adAccountId,
        businessAccountId: credentials.businessAccountId,
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        accessToken: credentials.accessToken,
      };

      const connected = await this.testConnection(this.credentials);
      this.isConnected = connected;
      return connected;
    }, "Connect to Meta Ads");
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    return this.runWithErrorHandling(async () => {
      if (!credentials.adAccountId || !credentials.accessToken) return false;

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Em produção faria chamada à Meta Marketing API:
      // const response = await fetch(
      //   `https://graph.facebook.com/v18.0/act_${credentials.adAccountId}/campaigns?access_token=${credentials.accessToken}&limit=1`
      // );
      // const data = await response.json();
      // return !data.error;

      return true;
    }, "Test Meta Ads connection");
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
    }, "Sync Meta Ads data");
  }

  async fetchMetrics(options?: SyncOptions): Promise<DailyMetrics[]> {
    const { start, end } = this.getDateRange(options);
    const dates = this.generateDateSequence(start, end);
    const metrics: DailyMetrics[] = [];

    const campaigns = [
      { name: "FB_Awareness_Q1", objective: "BRAND_AWARENESS" },
      { name: "IG_Engagement_Promo", objective: "ENGAGEMENT" },
      { name: "FB_Conversions_Lead", objective: "LEAD_GENERATION" },
      { name: "IG_Conversions_Sale", objective: "CONVERSIONS" },
      { name: "FB_Retargeting_Warm", objective: "REACH" },
    ];

    for (const date of dates) {
      for (const campaign of campaigns) {
        const campaignMetrics = this.generateCampaignMetrics(date, campaign);
        metrics.push(campaignMetrics);
      }
    }

    return metrics;
  }

  private generateCampaignMetrics(
    date: Date,
    campaign: { name: string; objective: string },
  ): DailyMetrics {
    const impressions = Math.floor(Math.random() * 80000) + 20000;
    const reach = Math.floor(impressions * (Math.random() * 0.3 + 0.5));
    const clicks = Math.floor(impressions * (Math.random() * 0.03 + 0.01));
    const spend = clicks * (Math.random() * 1.5 + 0.3);
    const leads = Math.floor(clicks * (Math.random() * 0.15 + 0.05));
    const purchases = Math.floor(leads * (Math.random() * 0.3 + 0.1));
    const revenue = purchases * (Math.random() * 100 + 40);

    const connectorMetrics: ConnectorMetrics = {
      impressions,
      clicks,
      spend,
      revenue,
      conversions: purchases,
      ctr: (clicks / impressions) * 100,
      cpc: spend / clicks,
      cpm: (spend / impressions) * 1000,
      roas: revenue / spend,
      cpl: spend / leads,
    };

    return {
      date,
      channelId: this.id,
      campaign: campaign.name,
      metrics: connectorMetrics,
    };
  }

  getChannelInfo(): ChannelInfo {
    return {
      id: this.id,
      name: "meta-ads",
      displayName: this.name,
      type: this.type,
      icon: this.icon,
      status: this.isConnected ? "ACTIVE" : "DISCONNECTED",
      lastSyncAt: this.lastSyncAt,
    };
  }
}
