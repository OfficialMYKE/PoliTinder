/**
 * Hook personalizado useLoginForm.
 * Encapsula toda la lógica del formulario de inicio de sesión:
 * validación, estado de carga, visibilidad de contraseña y envío.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas/loginSchema";

interface UseLoginFormProps {
  // Función que se ejecuta al enviar el formulario exitosamente
  onSubmit: (data: LoginFormValues) => Promise<void>;
}

export function useLoginForm({ onSubmit }: UseLoginFormProps) {
  // Estado para controlar el spinner del botón de envío
  const [isLoading, setIsLoading] = useState(false);

  // Estado para alternar entre ver/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Inicialización de React Hook Form con el esquema de Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  /**
   * Manejador de envío del formulario.
   * Activa el estado de carga y ejecuta la función onSubmit proporcionada.
   */
  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Login failed:", error);
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
