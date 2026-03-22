import { prisma } from "@/lib/prisma";
import {
  BaseConnector,
  getConnector,
  getAllConnectors,
  DailyMetrics,
  ConnectorMetrics,
} from "@/lib/connectors";
import { ConnectorCredentials } from "@/lib/connectors/types";

export interface SyncJob {
  channelId: string;
  connectorId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed?: number;
  error?: string;
}

export class SyncEngine {
  private static instance: SyncEngine;
  private syncJobs: Map<string, SyncJob> = new Map();
  private isRunning: boolean = false;

  private constructor() {}

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  async syncChannel(
    organizationId: string,
    connectorId: string,
    options?: { since?: Date; until?: Date },
  ): Promise<{ success: boolean; job: SyncJob; error?: string }> {
    const jobId = `${organizationId}-${connectorId}-${Date.now()}`;
    const job: SyncJob = {
      channelId: connectorId,
      connectorId,
      status: "RUNNING",
      startedAt: new Date(),
    };

    this.syncJobs.set(jobId, job);

    try {
      const channel = await prisma.channel.findFirst({
        where: {
          connectorType: connectorId,
          organizationId,
        },
      });

      if (!channel) {
        throw new Error(`Channel ${connectorId} not found for organization`);
      }

      const connector = getConnector(connectorId);
      if (!connector) {
        throw new Error(`Connector ${connectorId} not registered`);
      }

      let credentials: ConnectorCredentials = {};
      if (channel.credentials) {
        credentials = JSON.parse(channel.credentials);
      }

      const isConnected = await connector.connect(credentials);
      if (!isConnected) {
        throw new Error("Failed to connect to channel");
      }

      const result = await connector.sync({
        since: options?.since,
        until: options?.until,
      });

      if (result.success && result.data) {
        await this.saveMetrics(channel.id, result.data as DailyMetrics[]);
        await this.updateChannelSyncStatus(channel.id);
      }

      job.status = "COMPLETED";
      job.completedAt = new Date();
      job.recordsProcessed = result.recordsProcessed;
      this.syncJobs.set(jobId, job);

      return { success: true, job };
    } catch (error) {
      job.status = "FAILED";
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : String(error);
      this.syncJobs.set(jobId, job);

      return {
        success: false,
        job,
        error: job.error,
      };
    }
  }

  async syncAllChannels(
    organizationId: string,
    options?: { since?: Date; until?: Date },
  ): Promise<{
    results: Array<{ connectorId: string; success: boolean; error?: string }>;
  }> {
    if (this.isRunning) {
      throw new Error("Sync already in progress");
    }

    this.isRunning = true;
    const results: Array<{
      connectorId: string;
      success: boolean;
      error?: string;
    }> = [];

    try {
      const channels = await prisma.channel.findMany({
        where: {
          organizationId,
          status: "ACTIVE",
        },
      });

      for (const channel of channels) {
        const result = await this.syncChannel(
          organizationId,
          channel.connectorType,
          options,
        );
        results.push({
          connectorId: channel.connectorType,
          success: result.success,
          error: result.error,
        });
      }

      return { results };
    } finally {
      this.isRunning = false;
    }
  }

  private async saveMetrics(
    channelId: string,
    metrics: DailyMetrics[],
  ): Promise<void> {
    for (const metric of metrics) {
      await prisma.channelMetrics.upsert({
        where: {
          channelId_date_source_campaign: {
            channelId,
            date: metric.date,
            source: metric.source || "total",
            campaign: metric.campaign || "all",
          },
        },
        create: {
          channelId,
          date: metric.date,
          source: metric.source || "total",
          campaign: metric.campaign || "all",
          impressions: metric.metrics.impressions || null,
          clicks: metric.metrics.clicks || null,
          spend:
            metric.metrics.spend !== undefined ? metric.metrics.spend : null,
          revenue:
            metric.metrics.revenue !== undefined
              ? metric.metrics.revenue
              : null,
          conversions: metric.metrics.conversions || null,
          users: metric.metrics.users || null,
          sessions: metric.metrics.sessions || null,
          pageviews: metric.metrics.pageviews || null,
          bounceRate: metric.metrics.bounceRate || null,
          ctr: metric.metrics.ctr || null,
          cpc: metric.metrics.cpc || null,
          cpm: metric.metrics.cpm || null,
          roas: metric.metrics.roas || null,
          cpl: metric.metrics.cpl || null,
          conversionRate: metric.metrics.conversionRate || null,
        },
        update: {
          impressions: metric.metrics.impressions || null,
          clicks: metric.metrics.clicks || null,
          spend:
            metric.metrics.spend !== undefined ? metric.metrics.spend : null,
          revenue:
            metric.metrics.revenue !== undefined
              ? metric.metrics.revenue
              : null,
          conversions: metric.metrics.conversions || null,
          users: metric.metrics.users || null,
          sessions: metric.metrics.sessions || null,
          pageviews: metric.metrics.pageviews || null,
          bounceRate: metric.metrics.bounceRate || null,
          ctr: metric.metrics.ctr || null,
          cpc: metric.metrics.cpc || null,
          cpm: metric.metrics.cpm || null,
          roas: metric.metrics.roas || null,
          cpl: metric.metrics.cpl || null,
          conversionRate: metric.metrics.conversionRate || null,
        },
      });
    }
  }

  private async updateChannelSyncStatus(channelId: string): Promise<void> {
    await prisma.channel.update({
      where: { id: channelId },
      data: { lastSyncAt: new Date() },
    });
  }

  getJobStatus(jobId: string): SyncJob | undefined {
    return this.syncJobs.get(jobId);
  }

  getActiveJobs(): SyncJob[] {
    return Array.from(this.syncJobs.values()).filter(
      (job) => job.status === "RUNNING" || job.status === "PENDING",
    );
  }

  isSyncInProgress(): boolean {
    return this.isRunning;
  }
}

export const syncEngine = SyncEngine.getInstance();
