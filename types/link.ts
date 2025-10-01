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

export interface LinkStatusError {
  message: string;
  reason?: 'disabled' | 'not_yet_active' | 'expired';
  activateAt?: string;
  expiresAt?: string;
}
