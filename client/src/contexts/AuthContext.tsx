import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { IAuthUser, IAuthState, IAuthError } from "../types/auth";
import { ITokenStorage } from "../services/storage/ITokenStorage";
import { IUserStorage } from "../services/storage/IUserStorage";
import { auth } from "../services/firebase";

/**
 * Interfaces del contexto de autenticación
 * Define el contrato que expone AuthContext a los componentes consumidores
 */
interface AuthContextProps {
  state: IAuthState;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  tokenStorage: ITokenStorage;
  userStorage: IUserStorage;
}

/**
 * Mapea errores de Firebase a mensajes legibles en español
 * @param error - Objeto de error devuelto por Firebase Auth
 */
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

/**
 * Proveedor de autenticación que envuelve la aplicación
 * Inicializa el estado desde almacenamiento local y expone
 * las funciones: login, register, loginWithMicrosoft, resetPassword, logout
 */
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

        try {
          await sendEmailVerification(fbUser);
        } catch {
          console.warn("No se pudo enviar el correo de verificacion");
        }

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

  const loginWithMicrosoft = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.setCustomParameters({
        prompt: "select_account",
        tenant: "organizations",
      });
      const result = await signInWithPopup(auth, provider);
      const { user: fbUser } = result;
      const token = await fbUser.getIdToken();
      const user: IAuthUser = {
        id: fbUser.uid,
        email: fbUser.email || "",
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
  }, [tokenStorage, userStorage]);

  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch {
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        throw { code: "auth/user-not-found" };
      }
      await sendPasswordResetEmail(auth, email);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const mapped = mapFirebaseError(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: mapped,
      }));
      throw mapped;
    }
  }, [checkEmailExists]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Continúa aunque falle el cierre de sesión remoto
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
    <AuthContext.Provider value={{ state, login, register, loginWithMicrosoft, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @throws Error si se usa fuera de un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
