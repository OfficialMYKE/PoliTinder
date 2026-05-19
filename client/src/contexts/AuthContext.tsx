import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { IAuthUser, IAuthState, IAuthError } from "../types/auth";
import { ITokenStorage } from "../services/storage/ITokenStorage";
import { IUserStorage } from "../services/storage/IUserStorage";
import { auth } from "../services/firebase";

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

function mapFirebaseError(error: any): IAuthError {
  const code = error?.code || "UNKNOWN_ERROR";
  const messages: Record<string, string> = {
    "auth/user-not-found": "No se encontró una cuenta con este correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Este correo ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El correo ingresado no es válido.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/network-request-failed": "Error de conexión. Verifica tu internet.",
  };
  return {
    code,
    message: messages[code] || error?.message || "Ocurrió un error inesperado.",
  };
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
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
        const { user: fbUser } = userCredential;
        const token = await fbUser.getIdToken();
        const user: IAuthUser = {
          id: fbUser.uid,
          email: fbUser.email || credentials.email,
          firstName: fbUser.displayName?.split(" ")[0] || "",
          lastName: fbUser.displayName?.split(" ").slice(1).join(" ") || "",
          createdAt: fbUser.metadata.creationTime
            ? new Date(fbUser.metadata.creationTime)
            : new Date(),
        };

        tokenStorage.setToken(token);
        userStorage.setUser(user);

        setState({
          user,
          token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (error: any) {
        const mapped = mapFirebaseError(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: mapped,
        }));
        throw mapped;
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
        const { user: fbUser } = userCredential;

        await updateProfile(fbUser, {
          displayName: `${credentials.firstName} ${credentials.lastName}`,
        });

        const token = await fbUser.getIdToken();
        const user: IAuthUser = {
          id: fbUser.uid,
          email: fbUser.email || credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          createdAt: fbUser.metadata.creationTime
            ? new Date(fbUser.metadata.creationTime)
            : new Date(),
        };

        tokenStorage.setToken(token);
        userStorage.setUser(user);

        setState({
          user,
          token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (error: any) {
        const mapped = mapFirebaseError(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: mapped,
        }));
        throw mapped;
      }
    },
    [tokenStorage, userStorage]
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // continúa aunque falle el cierre de sesión remoto
    }
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
