import { BaseConnector } from "./base.connector";
import { GoogleAnalyticsConnector } from "./google-analytics";
import { GoogleAdsConnector } from "./google-ads";
import { MetaAdsConnector } from "./meta-ads";
import { ConnectorType, ChannelInfo } from "./types";

export { BaseConnector } from "./base.connector";
export { GoogleAnalyticsConnector } from "./google-analytics";
export { GoogleAdsConnector } from "./google-ads";
export { MetaAdsConnector } from "./meta-ads";

export const CONNECTOR_REGISTRY: Map<string, BaseConnector> = new Map();

export function registerConnector(connector: BaseConnector): void {
  CONNECTOR_REGISTRY.set(connector.id, connector);
}

export function getConnector(id: string): BaseConnector | undefined {
  return CONNECTOR_REGISTRY.get(id);
}

export function getConnectorsByType(type: ConnectorType): BaseConnector[] {
  return Array.from(CONNECTOR_REGISTRY.values()).filter((c) => c.type === type);
}

export function getAllConnectors(): BaseConnector[] {
  return Array.from(CONNECTOR_REGISTRY.values());
}

export function getAvailableChannels(): ChannelInfo[] {
  return getAllConnectors().map((connector) => connector.getChannelInfo());
}

export function initializeConnectors(): void {
  registerConnector(new GoogleAnalyticsConnector());
  registerConnector(new GoogleAdsConnector());
  registerConnector(new MetaAdsConnector());
}

initializeConnectors();
