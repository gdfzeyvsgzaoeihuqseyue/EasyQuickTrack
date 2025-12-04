import type { ShortLinkAnalytics } from "./analytics";
import type { LinkMetadata } from "./metadata";

export interface ShortLink {
  id: string
  longUrl: string
  shortCode: string
  shortLink: string
  clicks: number
  createdAt: number
  updatedAt: number
  disabled?: boolean
  activateAt?: string;
  expiresAt?: string;
  analytics?: Readonly<ShortLinkAnalytics[]>;
  metadata?: LinkMetadata;
}

export interface GuestShortLink extends ShortLink {
  isGuestLink: boolean
  guestAccessToken?: string
  remainingDays?: number | null
  isExpired?: boolean
  status?: 'active' | 'expired' | 'disabled'
}

export interface LinkStatusError {
  message: string;
  reason?: 'disabled' | 'not_yet_active' | 'expired';
  activateAt?: string;
  expiresAt?: string;
}

export interface ShortLinkResponse {
  success: boolean
  message: string
  link: {
    id: string
    longUrl: string
    shortCode: string
    shortLink: string
    clicks: number
    createdAt: number
    updatedAt: number
    disabled?: boolean
    activateAt?: string
    expiresAt?: string
    metadata?: {
      url: string
      title?: string
      description?: string
      image?: string
      favicon?: string
      keywords?: string
      language?: string
      author?: string
      source?: string
      siteName?: string
      ogType?: string
      twitterCard?: string
      lastUpdated?: number
    }
  }
}

export interface CreateGuestLinkResponse {
  success: boolean
  message: string
  link: GuestShortLink
  guestAccessToken: string
  expiresAt?: string
  warning?: string
  note?: string
}

export interface GetGuestLinkResponse {
  success: boolean
  message: string
  data: GuestShortLink
  currentTime?: string
}

export interface TooManyRequestsError {
  message: string
  limit: number
  resetTime: string
}
