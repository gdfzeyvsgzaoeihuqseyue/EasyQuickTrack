export interface ShortLinkSitemap {
  id: string;
  title?: string;
  url: string;
  sitemapXml: string;
  options: SitemapGenerationOptions; 
  urlsCount: number;
  lastGenerated: string; 
  createdAt: string;
  updatedAt: string;
  scannedUrls?: string[];
}

export interface SitemapGenerationOptions {
  url: string;
  includePriority?: boolean;
  includeLastmod?: boolean;
  includeChangefreq?: boolean;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  maxPages?: number;
  followRobotsTxt?: boolean;
  ignoreNoindex?: boolean;
  ignoreNofollow?: boolean;
  ignoreNonCanonical?: boolean;
  includeImages?: boolean;
  title?: string;
  socketId?: string; 
}

export interface GenerateSitemapResponse {
  message: string;
  sitemapId: string;
  urlsCount: number;
  sitemapXml: string;
}

export interface GetSitemapsResponse {
  message: string;
  nb: number;
  nbOnPage: number;
  currentPage: number;
  totalPages: number;
  data: ShortLinkSitemap[];
}

export interface GetSitemapResponse {
  success: boolean;
  message: string;
  data: ShortLinkSitemap;
}

export interface UpdateSitemapResponse {
  succes: boolean;
  message: string;
  data: ShortLinkSitemap;
}

export interface DeleteSitemapResponse {
  success: boolean;
  message: string;
  data: ShortLinkSitemap;
}

export interface SitemapProgressMessage {
  type: 'start' | 'info' | 'progress' | 'ignored' | 'error' | 'complete' | 'warning';
  message?: string;
  url?: string;
  reason?: string;
  error?: string;
}
