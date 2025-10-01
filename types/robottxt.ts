export interface UserAgentRules {
  allow?: string[]; 
  disallow?: string[]; 
}

export interface RobotsTxtConfig {
  id: string;
  title?: string;
  userAgents: { [key: string]: UserAgentRules };
  sitemapUrl?: string;
  customRules?: string;
  lastGenerated: string; 
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRobotsTxtPayload {
  title: string;
  userAgents: { [key: string]: UserAgentRules };
  sitemapUrl?: string;
  customRules?: string;
}

export interface GenerateRobotsTxtResponse {
  success: boolean;
  message: string;
  data: RobotsTxtConfig;
  robotsTxtContent: string;
}

export interface GetRobotsTxtsResponse {
  message: string;
  nb: number;
  nbOnPage: number;
  currentPage: number;
  totalPages: number;
  data: RobotsTxtConfig[];
}

export interface GetRobotsTxtResponse {
  success: boolean;
  message: string;
  data: RobotsTxtConfig;
}

export interface UpdateRobotsTxtResponse {
  success: boolean;
  message: string;
  data: RobotsTxtConfig;
}

export interface DeleteRobotsTxtResponse {
  success: boolean;
  message: string;
  data: RobotsTxtConfig;
}
