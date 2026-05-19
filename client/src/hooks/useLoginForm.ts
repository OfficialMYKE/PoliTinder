/**
 * Hook useLoginForm — SRP (Principio de Responsabilidad Única)
 * Encapsula la lógica del formulario de inicio de sesión:
 * validación con Zod, estado de carga, visibilidad de contraseña y envío.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas/loginSchema";

interface UseLoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
}

export function useLoginForm({ onSubmit }: UseLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    showPassword,
    setShowPassword,
    handleSubmit,
  };
}
