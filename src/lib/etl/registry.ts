import { Connector } from "./types";
import { GoogleAnalyticsConnector } from "./google-analytics";

export const AVAILABLE_CONNECTORS: Connector[] = [
    new GoogleAnalyticsConnector(),
    // Add other connectors here (Google Ads, HubSpot, etc.)
];

export function getConnector(id: string): Connector | undefined {
    return AVAILABLE_CONNECTORS.find((c) => c.id === id);
}
