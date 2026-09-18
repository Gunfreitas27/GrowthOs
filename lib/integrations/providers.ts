export interface IntegrationProvider {
  id: string;
  label: string;
  category: 'Mídia paga' | 'Dados de site' | 'Rede social';
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  extraAuthParams?: Record<string, string>;
}

// Google's OAuth app is the one already registered for login (auth.ts) — a
// single Google Cloud OAuth client can serve multiple redirect URIs/scopes,
// so Analytics reuses AUTH_GOOGLE_ID/SECRET instead of needing its own app.
// Every other provider needs its own app registered in that platform's own
// developer console before it can move out of "not configured" — there's no
// way around that per-provider step, it's each platform's own OAuth gate.
export const INTEGRATION_PROVIDERS: Record<string, IntegrationProvider> = {
  google_analytics: {
    id: 'google_analytics',
    label: 'Google Analytics',
    category: 'Dados de site',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  google_ads: {
    id: 'google_ads',
    label: 'Google Ads',
    category: 'Mídia paga',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/adwords',
    // Same Google app as Analytics, but the Ads API additionally requires a
    // Google Ads *developer token* (approved separately via the Google Ads
    // API Center — not an OAuth credential, a different approval process).
    // GOOGLE_ADS_DEVELOPER_TOKEN gates readiness independent of the OAuth
    // client id/secret below.
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? process.env.AUTH_GOOGLE_SECRET : undefined,
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  meta_ads: {
    id: 'meta_ads',
    label: 'Meta Ads',
    category: 'Mídia paga',
    authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scope: 'ads_read',
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    category: 'Rede social',
    authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scope: 'instagram_basic,pages_show_list',
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
  },
  linkedin_ads: {
    id: 'linkedin_ads',
    label: 'LinkedIn',
    category: 'Rede social',
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_ads r_ads_reporting',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  tiktok_ads: {
    id: 'tiktok_ads',
    label: 'TikTok',
    category: 'Rede social',
    authorizeUrl: 'https://business-api.tiktok.com/portal/auth',
    tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
    scope: 'ads_management',
    clientId: process.env.TIKTOK_APP_ID,
    clientSecret: process.env.TIKTOK_APP_SECRET,
  },
};

export function isProviderConfigured(id: string): boolean {
  const p = INTEGRATION_PROVIDERS[id];
  return Boolean(p?.clientId && p?.clientSecret);
}

export function getProvider(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS[id];
}
