import * as z from "zod";

export const loginSchema = z.object({
  // Validación de correo: debe ser un email válido y no estar vacío
  email: z
    .string()
    .email({ message: "Por favor, ingresa un correo institucional válido." }),

  // Validación de contraseña: mínimo 8 caracteres
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),

  // Opción para mantener la sesión iniciada
  rememberMe: z.boolean().default(false).optional(),
});

// Tipo inferido a partir del esquema para usar en TypeScript
export type LoginFormValues = z.infer<typeof loginSchema>;
