import { describe, it, expect } from "vitest";
import { registerSchema } from "../../schemas/registerSchema";

const validData = {
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan.perez@epn.edu.ec",
  password: "12345678",
  confirmPassword: "12345678",
  acceptTerms: true,
};

describe("registerSchema", () => {
  it("acepta datos de registro válidos", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rechaza firstName con menos de 2 caracteres", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("2 caracteres");
    }
  });

  it("rechaza lastName con menos de 2 caracteres", () => {
    const result = registerSchema.safeParse({ ...validData, lastName: "B" });
    expect(result.success).toBe(false);
  });

  it("rechaza email sin dominio @epn.edu.ec", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "juan@gmail.com",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña menor a 8 caracteres", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando confirmPassword no coincide", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "diferente",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(" ");
      expect(msg).toContain("no coinciden");
    }
  });

  it("rechaza cuando acceptTerms es false", () => {
    const result = registerSchema.safeParse({
      ...validData,
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("términos");
    }
  });

  it("rechaza firstName vacío", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza lastName vacío", () => {
    const result = registerSchema.safeParse({ ...validData, lastName: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza email vacío", () => {
    const result = registerSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
  });
});
