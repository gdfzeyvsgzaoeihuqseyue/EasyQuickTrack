export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface ServiceAccess {
  serviceId: string;
  serviceName: string;
  domain: string;
  role: 'user' | 'admin' | 'moderator';
  permissions: Record<string, any>;
  lastAccess?: string;
}

export interface ProfileResponse {
  user: UserProfile;
  services: ServiceAccess[];
}
