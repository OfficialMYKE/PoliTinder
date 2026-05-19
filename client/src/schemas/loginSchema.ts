import * as z from "zod";

/**
 * Esquema de validación del formulario de inicio de sesión
 * Valida email, contraseña (mín. 8 caracteres) y la opción "Recordarme"
 */

export const loginSchema = z.object({
  // Validación de correo: debe ser un email válido, no vacío y del dominio EPN
  email: z
    .string()
    .email({ message: "Por favor, ingresa un correo válido." })
    .endsWith("@epn.edu.ec", {
      message:
        "Debes iniciar sesión con tu correo institucional (@epn.edu.ec).",
    }),

  // Validación de contraseña: mínimo 8 caracteres
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),

  // Opción para mantener la sesión iniciada
  rememberMe: z.boolean().default(false).optional(),
});

// Tipo inferido a partir del esquema para usar en TypeScript
export type LoginFormValues = z.infer<typeof loginSchema>;
