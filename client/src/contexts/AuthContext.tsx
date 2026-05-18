/**
 * AuthContext - DIP (Dependency Inversion Principle)
 * Provides auth state and services via React Context for dependency injection
 */

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { IAuthUser, IAuthState, IAuthError } from "../types/auth";
import { ITokenStorage } from "../services/storage/ITokenStorage";
import { IUserStorage } from "../services/storage/IUserStorage";

interface AuthContextProps {
  state: IAuthState;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  tokenStorage: ITokenStorage;
  userStorage: IUserStorage;
}

export function AuthProvider({
  children,
  tokenStorage,
  userStorage,
}: AuthProviderProps) {
  const [state, setState] = useState<IAuthState>({
    user: userStorage.getUser() as IAuthUser | null,
    token: tokenStorage.getToken(),
    isLoading: false,
    error: null,
    isAuthenticated: !!tokenStorage.getToken(),
  });

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        // Simulate API call - replace with actual API
        const mockResponse = {
          user: {
            id: "1",
            email: credentials.email,
            firstName: "User",
            lastName: "Test",
            createdAt: new Date(),
          } as IAuthUser,
          token: "mock-token",
        };

        tokenStorage.setToken(mockResponse.token);
        userStorage.setUser(mockResponse.user);

        setState({
          user: mockResponse.user,
          token: mockResponse.token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            code: "LOGIN_ERROR",
            message: "Login failed",
          } as IAuthError,
        }));
        throw error;
      }
    },
    [tokenStorage, userStorage]
  );

  const register = useCallback(
    async (credentials: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        // Simulate API call - replace with actual API
        const mockResponse = {
          user: {
            id: "1",
            email: credentials.email,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            createdAt: new Date(),
          } as IAuthUser,
          token: "mock-token",
        };

        tokenStorage.setToken(mockResponse.token);
        userStorage.setUser(mockResponse.user);

        setState({
          user: mockResponse.user,
          token: mockResponse.token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            code: "REGISTER_ERROR",
            message: "Registration failed",
          } as IAuthError,
        }));
        throw error;
      }
    },
    [tokenStorage, userStorage]
  );

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    userStorage.removeUser();
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    });
  }, [tokenStorage, userStorage]);

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
