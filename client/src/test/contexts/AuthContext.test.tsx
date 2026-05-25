import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  OAuthProvider: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

vi.mock("../../services/firebase", () => ({
  auth: {},
}));

const mockTokenStorage = {
  setToken: vi.fn(),
  getToken: vi.fn(() => null),
  removeToken: vi.fn(),
};

const mockUserStorage = {
  setUser: vi.fn(),
  getUser: vi.fn(() => null),
  removeUser: vi.fn(),
};

function renderAuthHook() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthProvider
        tokenStorage={mockTokenStorage}
        userStorage={mockUserStorage}
      >
        {children}
      </AuthProvider>
    ),
  });
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa con estado no autenticado", () => {
    const { result } = renderAuthHook();
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it("login exitoso actualiza el estado", async () => {
    const signInWithEmailAndPassword = (
      await import("firebase/auth")
    ).signInWithEmailAndPassword;
    const mockUser = {
      uid: "123",
      email: "test@epn.edu.ec",
      displayName: "Test User",
      getIdToken: vi.fn().mockResolvedValue("token123"),
      metadata: { creationTime: "2024-01-01" },
    };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: mockUser,
      providerId: null,
      _tokenResponse: null,
      operationType: "signIn",
    } as any);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({
        email: "test@epn.edu.ec",
        password: "12345678",
      });
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user?.id).toBe("123");
    expect(result.current.state.token).toBe("token123");
    expect(mockTokenStorage.setToken).toHaveBeenCalledWith("token123");
    expect(mockUserStorage.setUser).toHaveBeenCalled();
  });

  it("login con error mapea el mensaje a español", async () => {
    const signInWithEmailAndPassword = (
      await import("firebase/auth")
    ).signInWithEmailAndPassword;
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/user-not-found",
    });

    const { result } = renderAuthHook();

    await act(async () => {
      try {
        await result.current.login({
          email: "noexiste@epn.edu.ec",
          password: "12345678",
        });
      } catch {}
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.error?.message).toBe(
      "No se encontró una cuenta con este correo."
    );
  });

  it("registro exitoso actualiza el estado", async () => {
    const createUserWithEmailAndPassword = (
      await import("firebase/auth")
    ).createUserWithEmailAndPassword;
    const mockUser = {
      uid: "456",
      email: "new@epn.edu.ec",
      getIdToken: vi.fn().mockResolvedValue("token456"),
      metadata: { creationTime: "2024-06-01" },
    };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: mockUser,
      providerId: null,
      _tokenResponse: null,
      operationType: "signIn",
    } as any);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.register({
        firstName: "Nuevo",
        lastName: "Usuario",
        email: "new@epn.edu.ec",
        password: "12345678",
      });
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user?.firstName).toBe("Nuevo");
    expect(result.current.state.user?.lastName).toBe("Usuario");
  });

  it("logout limpia el estado y el storage", async () => {
    const { signOut } = await import("firebase/auth");
    vi.mocked(signOut).mockResolvedValue(undefined);

    const { result } = renderAuthHook();

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(mockTokenStorage.removeToken).toHaveBeenCalled();
    expect(mockUserStorage.removeUser).toHaveBeenCalled();
  });

  it("resetPassword envía el email de recuperación", async () => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.resetPassword("user@epn.edu.ec");
    });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      "user@epn.edu.ec"
    );
    expect(result.current.state.isLoading).toBe(false);
  });

  it("resetPassword con error mapea el mensaje", async () => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    vi.mocked(sendPasswordResetEmail).mockRejectedValue({
      code: "auth/user-not-found",
    });

    const { result } = renderAuthHook();

    await act(async () => {
      try {
        await result.current.resetPassword("nadie@epn.edu.ec");
      } catch {}
    });

    expect(result.current.state.error?.message).toBe(
      "No se encontró una cuenta con este correo."
    );
  });
});
