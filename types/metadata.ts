import type { ShortLink } from "./link";
import type { ShortLinkAnalytics } from "./analytics";

export interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  keywords?: string;
  language?: string;
  author?: string;
  source?: string;
  siteName?: string;
  ogType?: string;
  twitterCard?: string;
  allOgImages?: readonly string[]; 
  allImgTags?: readonly string[];
  lastUpdated?: number; 
}

export interface ExtractMetadataResponse {
  success: boolean;
  message: string;
  data: LinkMetadata;
}

export interface CreateLinkResponse {
  message: string
  link: ShortLink
}

export interface GetLinksResponse {
  success: boolean
  message: string
  nb: number
  nbOnPage: number
  currentPage: number
  totalPages: number
  data: ShortLink[]
}

export interface GetLinkResponse {
  success: boolean
  message: string
  data: ShortLink & { analytics?: readonly ShortLinkAnalytics[] }
}

export interface UpdateLinkResponse {
  success: boolean
  message: string
  data: ShortLink
}

export interface DeleteLinkResponse {
  message: string
  deleted: ShortLink
}
