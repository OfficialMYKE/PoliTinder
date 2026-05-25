import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../../pages/Login";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: false, isLoading: false, error: null, user: null, token: null },
    login: vi.fn(),
    loginWithMicrosoft: vi.fn(),
  }),
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe("Login Page", () => {
  it("renderiza el título de inicio de sesión", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("renderiza el enlace de registro", () => {
    renderLogin();
    expect(screen.getByText("Crea una aquí")).toBeInTheDocument();
  });

  it("renderiza el enlace de olvidé contraseña", () => {
    renderLogin();
    expect(screen.getByText("¿Olvidaste tu contraseña?")).toBeInTheDocument();
  });

  it("renderiza el botón de inicio de sesión", () => {
    renderLogin();
    const buttons = screen.getAllByRole("button", { name: /iniciar sesión/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza el botón de Microsoft", () => {
    renderLogin();
    expect(screen.getByText("Continuar con Microsoft")).toBeInTheDocument();
  });
});
