/**
 * Tipos del sistema de autenticación — ISP (Principio de Segregación de Interfaces)
 */

export type UserRole = "student" | "moderator" | "admin";

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterCredentials extends ILoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}

export interface IAuthError {
  code: string;
  message: string;
  field?: string;
}

export interface IAuthState {
  user: IAuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: IAuthError | null;
  isAuthenticated: boolean;
}
