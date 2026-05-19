import * as z from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    lastName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    email: z.string().email({ message: "Ingresa un correo válido." }),
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
