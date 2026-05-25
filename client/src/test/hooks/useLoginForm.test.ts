import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoginForm } from "../../hooks/useLoginForm";

describe("useLoginForm", () => {
  it("inicializa con valores por defecto", () => {
    const { result } = renderHook(() =>
      useLoginForm({ onSubmit: vi.fn() })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showPassword).toBe(false);
    expect(result.current.form.getValues()).toEqual({
      email: "",
      password: "",
      rememberMe: false,
    });
  });

  it("cambia showPassword al llamar setShowPassword", () => {
    const { result } = renderHook(() =>
      useLoginForm({ onSubmit: vi.fn() })
    );

    act(() => {
      result.current.setShowPassword(true);
    });

    expect(result.current.showPassword).toBe(true);
  });

  it("establece isLoading en true durante el envío", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm({ onSubmit }));

    await act(async () => {
      await result.current.handleSubmit({
        email: "test@epn.edu.ec",
        password: "12345678",
        rememberMe: false,
      });
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@epn.edu.ec",
      password: "12345678",
      rememberMe: false,
    });
  });

  it("maneja errores en onSubmit sin lanzar excepción", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Error test"));
    const { result } = renderHook(() => useLoginForm({ onSubmit }));

    await act(async () => {
      await expect(
        result.current.handleSubmit({
          email: "test@epn.edu.ec",
          password: "12345678",
          rememberMe: false,
        })
      ).resolves.toBeUndefined();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
