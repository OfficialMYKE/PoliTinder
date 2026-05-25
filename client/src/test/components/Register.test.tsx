import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../../pages/Register";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: false, isLoading: false, error: null, user: null, token: null },
    register: vi.fn(),
    loginWithMicrosoft: vi.fn(),
  }),
}));

function renderRegister() {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
}

describe("Register Page", () => {
  it("renderiza el título de registro", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("renderiza el enlace de inicio de sesión", () => {
    renderRegister();
    expect(screen.getByText("Inicia sesión aquí")).toBeInTheDocument();
  });

  it("renderiza el botón de registro", () => {
    renderRegister();
    const buttons = screen.getAllByRole("button", { name: /crear cuenta/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza el botón de Microsoft", () => {
    renderRegister();
    expect(screen.getByText("Registrarse con Microsoft")).toBeInTheDocument();
  });
});
