import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../../pages/ForgotPassword";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: false, isLoading: false, error: null, user: null, token: null },
    resetPassword: vi.fn(),
  }),
}));

function renderForgotPassword() {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
}

describe("ForgotPassword Page", () => {
  it("renderiza el título de recuperación", () => {
    renderForgotPassword();
    expect(screen.getByText("Recuperar contraseña")).toBeInTheDocument();
  });

  it("renderiza el enlace de volver al login", () => {
    renderForgotPassword();
    expect(screen.getByText("Volver al inicio de sesión")).toBeInTheDocument();
  });

  it("renderiza el botón de enviar", () => {
    renderForgotPassword();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });
});
