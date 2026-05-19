/**
 * Hook useForgotPasswordForm — SRP (Principio de Responsabilidad Única)
 * Encapsula la lógica del formulario de recuperación de contraseña:
 * validación del correo institucional, estado de carga y envío.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "../schemas/forgotPasswordSchema";

interface UseForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => Promise<void>;
}

export function useForgotPasswordForm({
  onSubmit,
}: UseForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleSubmit,
  };
}
