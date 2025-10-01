// PageSpeed
export interface PageSpeedMetric {
  title: string;
  displayValue: string;
  score: number;
}

export interface PageSpeedResult {
  url: string;
  performanceScore: number;
  metrics: {
    'first-contentful-paint'?: PageSpeedMetric;
    'largest-contentful-paint'?: PageSpeedMetric;
    'interactive'?: PageSpeedMetric;
    'speed-index'?: PageSpeedMetric;
    'total-blocking-time'?: PageSpeedMetric;
    'cumulative-layout-shift'?: PageSpeedMetric;
  };
}

// SocialsContacts
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  [key: string]: string | undefined; 
}

export interface ExtractionResult {
  emails: string[];
  phoneNumbers: string[];
  socialLinks: SocialLinks;
}

export interface ProgressMessage {
  type: 'progress' | 'info' | 'warning' | 'error' | 'success' | 'start' | 'complete';
  message: string;
  url?: string;
}
