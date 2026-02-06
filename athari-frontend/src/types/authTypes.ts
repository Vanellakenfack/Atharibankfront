/**
 * Authentication Types
 * TypeScript interfaces for authentication API responses
 */

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: string[];
  abilities: string[];
  role?: string; // For backward compatibility
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface GetCurrentUserResponse extends User {}

export interface AuthError {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
}
