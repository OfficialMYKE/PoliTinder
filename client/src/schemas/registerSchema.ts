import * as z from "zod";

/**
 * Esquema de validación del formulario de registro — SRP
 * Reglas: nombres (mín. 2 caracteres), email válido, contraseña (mín. 8),
 * confirmación de contraseña coincidente y aceptación de términos.
 */
export const registerSchema = z
  .object({
    firstName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    lastName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    email: z
      .string()
      .email({ message: "Ingresa un correo válido." })
      .endsWith("@epn.edu.ec", {
        message: "Debes usar tu correo institucional (@epn.edu.ec).",
      }),
    password: z.string().min(8, { message: "Mínimo 8 caracteres." }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
