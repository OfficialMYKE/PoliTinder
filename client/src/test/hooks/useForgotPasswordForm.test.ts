import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForgotPasswordForm } from "../../hooks/useForgotPasswordForm";

describe("useForgotPasswordForm", () => {
  it("inicializa con valores por defecto", () => {
    const { result } = renderHook(() =>
      useForgotPasswordForm({ onSubmit: vi.fn() })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.form.getValues()).toEqual({ email: "" });
  });

  it("llama a onSubmit con el email", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForgotPasswordForm({ onSubmit })
    );

    await act(async () => {
      await result.current.handleSubmit({
        email: "user@epn.edu.ec",
      });
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: "user@epn.edu.ec" });
  });

  it("vuelve isLoading a false tras error", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Error"));
    const { result } = renderHook(() =>
      useForgotPasswordForm({ onSubmit })
    );

    await act(async () => {
      await result.current.handleSubmit({
        email: "user@epn.edu.ec",
      });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
