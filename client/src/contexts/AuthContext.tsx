import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { IAuthUser, IAuthState, IAuthError, UserRole } from "../types/auth";
import { ITokenStorage } from "../services/storage/ITokenStorage";
import { IUserStorage } from "../services/storage/IUserStorage";
import { auth } from "../services/firebase";
import { supabase } from "../services/supabase";

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
/**
 * Obtiene el rol del usuario desde la tabla profiles en Supabase
 */
async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("[Auth] Error fetching role:", error.message);
      return "student";
    }
    if (!data) {
      console.warn("[Auth] No profile found for", userId);
      return "student";
    }
    console.log("[Auth] Role fetched:", data.role);
    return (data.role as UserRole) || "student";
  } catch (err) {
    console.warn("[Auth] Exception fetching role:", err);
    return "student";
  }
}

/**
 * Construye un objeto IAuthUser a partir del usuario de Firebase y el rol
 */
function buildAuthUser(
  fbUser: any,
  credentials?: { firstName: string; lastName: string; email: string },
  role: UserRole = "student",
): IAuthUser {
  return {
    id: fbUser.uid,
    email: fbUser.email || credentials?.email || "",
    firstName:
      credentials?.firstName ||
      fbUser.displayName?.split(" ")[0] ||
      "",
    lastName:
      credentials?.lastName ||
      fbUser.displayName?.split(" ").slice(1).join(" ") ||
      "",
    role,
    createdAt: fbUser.metadata.creationTime
      ? new Date(fbUser.metadata.creationTime)
      : new Date(),
  };
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
    isLoading: !!tokenStorage.getToken(),
    error: null,
    isAuthenticated: !!tokenStorage.getToken(),
  });

  useEffect(() => {
    const storedUser = userStorage.getUser() as IAuthUser | null;
    if (!storedUser) return;

    fetchUserRole(storedUser.id).then((role) => {
      const updatedUser: IAuthUser = { ...storedUser, role };
      userStorage.setUser(updatedUser);
      setState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        const role = await fetchUserRole(fbUser.uid);
        const user = buildAuthUser(fbUser, undefined, role);

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
        const user = buildAuthUser(fbUser, credentials, "student");

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
      const role = await fetchUserRole(fbUser.uid);
      const user = buildAuthUser(fbUser, undefined, role);

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

  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
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
  }, []);

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
