export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface Service {
  serviceId: string;
  serviceName: string;
  domain: string;
  role: 'user' | 'admin' | 'moderator';
  permissions: Record<string, any>;
  lastAccess?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  services: Service[];
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  services: Service[];
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}
