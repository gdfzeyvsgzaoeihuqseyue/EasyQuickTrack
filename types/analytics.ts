import type { ShortLink } from "./link";

export interface ShortLinkAnalytics {
  id: string;
  shortLink: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  langue: string;
  source: {
    type: 'direct' | 'social_media' | 'search_engine' | 'referral' | 'unknown';
    nom: string;
    referent: string | null;
  };
  geolocalisation: {
    pays: string;
    ville: string;
  };
  appareil: {
    os: string;
    navigateur: string;
    type: string;
  };
}

// Interface de données
export interface AnalyticsStats {
  totalClicks: number;
  uniqueVisitors: number;
  topCountries: [string, number][];
  topCities: [string, number][];
  topDevices: [string, number][];
  topBrowsers: [string, number][];
  topSources: [string, number][];
  topOs: [string, number][];
  topLanguages: [string, number][];
  clicksByDay: [string, number][];
  clicksByHour: [string, number][];
}

export interface GetLinkWithAnalyticsResponse {
  success: boolean;
  message: string;
  data: ShortLink & {
    analytics?: ShortLinkAnalytics[];
  };
}
