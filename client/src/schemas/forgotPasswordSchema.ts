import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Ingresa un correo institucional válido." })
    .regex(
      /^[a-zA-Z0-9._%+-]+@epn\.edu\.ec$/,
      { message: "Debes usar tu correo institucional (@epn.edu.ec)." }
    ),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
