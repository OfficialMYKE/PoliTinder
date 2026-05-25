import { describe, it, expect } from "vitest";
import { forgotPasswordSchema } from "../../schemas/forgotPasswordSchema";

describe("forgotPasswordSchema", () => {
  it("acepta un email institucional válido", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "usuario@epn.edu.ec",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email sin @epn.edu.ec", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "usuario@gmail.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("correo institucional");
    }
  });

  it("rechaza un email inválido", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza email vacío", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza email con dominio parcial @epn", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "usuario@epn.com",
    });
    expect(result.success).toBe(false);
  });
});
