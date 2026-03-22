import {
  ConnectorCredentials,
  SyncOptions,
  SyncResult,
  ConnectorHealth,
  ConnectorType,
  ChannelInfo,
  DailyMetrics,
} from "./types";

export abstract class BaseConnector {
  public readonly id: string;
  public readonly name: string;
  public readonly icon: string;
  public readonly description: string;
  public readonly type: ConnectorType;

  protected credentials: ConnectorCredentials = {};
  protected isConnected: boolean = false;
  protected lastSyncAt?: Date;
  protected lastError?: string;

  constructor(
    id: string,
    name: string,
    icon: string,
    description: string,
    type: ConnectorType,
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.type = type;
  }

  abstract connect(credentials: ConnectorCredentials): Promise<boolean>;

  async disconnect(): Promise<boolean> {
    this.credentials = {};
    this.isConnected = false;
    this.lastSyncAt = undefined;
    return true;
  }

  abstract testConnection(credentials: ConnectorCredentials): Promise<boolean>;
  abstract sync(options?: SyncOptions): Promise<SyncResult>;
  abstract fetchMetrics(options?: SyncOptions): Promise<DailyMetrics[]>;
  abstract getChannelInfo(): ChannelInfo;

  protected async runWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      throw new Error(`${operationName} failed: ${this.lastError}`);
    }
  }

  protected createSyncResult(
    success: boolean,
    startTime: number,
    data: unknown[] = [],
    errors: string[] = [],
    warnings: string[] = [],
  ): SyncResult {
    return {
      success,
      recordsProcessed: data.length,
      recordsCreated: data.length,
      recordsUpdated: 0,
      errors,
      warnings,
      lastSync: new Date(),
      duration: Date.now() - startTime,
      data,
    };
  }

  getHealth(): ConnectorHealth {
    return {
      isConnected: this.isConnected,
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError,
    };
  }

  protected parseDate(dateStr: string | Date): Date {
    if (dateStr instanceof Date) return dateStr;
    return new Date(dateStr);
  }

  protected getDateRange(options?: SyncOptions): { start: Date; end: Date } {
    const end = options?.until || options?.dateRange?.end || new Date();
    const start =
      options?.since ||
      options?.dateRange?.start ||
      new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  protected generateDateSequence(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
