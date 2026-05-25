import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegisterForm } from "../../hooks/useRegisterForm";

describe("useRegisterForm", () => {
  it("inicializa con valores por defecto", () => {
    const { result } = renderHook(() =>
      useRegisterForm({ onSubmit: vi.fn() })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
    expect(result.current.form.getValues()).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });
  });

  it("alterna visibilidad de contraseña", () => {
    const { result } = renderHook(() =>
      useRegisterForm({ onSubmit: vi.fn() })
    );

    act(() => {
      result.current.setShowPassword(true);
    });
    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.setShowPassword(false);
    });
    expect(result.current.showPassword).toBe(false);
  });

  it("alterna visibilidad de confirmar contraseña", () => {
    const { result } = renderHook(() =>
      useRegisterForm({ onSubmit: vi.fn() })
    );

    act(() => {
      result.current.setShowConfirmPassword(true);
    });
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("llama a onSubmit con los datos del formulario", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRegisterForm({ onSubmit }));
    const formData = {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@epn.edu.ec",
      password: "12345678",
      confirmPassword: "12345678",
      acceptTerms: true,
    };

    await act(async () => {
      await result.current.handleSubmit(formData);
    });

    expect(onSubmit).toHaveBeenCalledWith(formData);
  });

  it("vuelve isLoading a false tras error en onSubmit", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Error"));
    const { result } = renderHook(() => useRegisterForm({ onSubmit }));

    await act(async () => {
      await result.current.handleSubmit({
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@epn.edu.ec",
        password: "12345678",
        confirmPassword: "12345678",
        acceptTerms: true,
      });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
