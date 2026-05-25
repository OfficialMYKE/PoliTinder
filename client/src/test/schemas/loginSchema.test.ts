import { describe, it, expect } from "vitest";
import { loginSchema } from "../../schemas/loginSchema";

describe("loginSchema", () => {
  it("acepta un email y contraseña válidos", () => {
    const result = loginSchema.safeParse({
      email: "test@epn.edu.ec",
      password: "12345678",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("acepta valores sin rememberMe", () => {
    const result = loginSchema.safeParse({
      email: "test@epn.edu.ec",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email sin @epn.edu.ec", () => {
    const result = loginSchema.safeParse({
      email: "test@gmail.com",
      password: "12345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("correo institucional");
    }
  });

  it("rechaza un email inválido", () => {
    const result = loginSchema.safeParse({
      email: "invalido",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña menor a 8 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "test@epn.edu.ec",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("8 caracteres");
    }
  });

  it("rechaza email vacío", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({
      email: "test@epn.edu.ec",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
