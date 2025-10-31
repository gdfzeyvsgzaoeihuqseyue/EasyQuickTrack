export interface GrantAccessInput {
  userId: string;
  serviceId: string;
  role?: 'user' | 'admin' | 'moderator';
  customPermissions?: Record<string, any>;
}

export interface GrantAccessResponse {
  message: string;
  access: {
    id: string;
    userId: string;
    serviceId: string;
    role: string;
    permissions: Record<string, any>;
  };
}

export interface RevokeAccessInput {
  userId: string;
  serviceId: string;
}

export interface RevokeAccessResponse {
  message: string;
}

export interface VerifyTokenInput {
  token: string;
  serviceDomain?: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    emailVerified: boolean;
  };
  userAccess?: {
    role: string;
    permissions: Record<string, any>;
  } | null;
  message?: string;
}
