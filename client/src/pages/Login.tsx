import { useState } from "react";
import { AuthFormSplitScreen } from "../components/ui/login";
import { useAuth } from "../contexts/AuthContext";

/**
 * Página de inicio de sesión
 * Gestiona el estado de alertas y delega el renderizado al componente AuthFormSplitScreen
 */
export default function Login() {
  const { login, loginWithMicrosoft } = useAuth();
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const handleLogin = async (data: any) => {
    setAlert(null);
    try {
      await login({ email: data.email, password: data.password });
      setAlert({
        type: "success",
        title: "Inicio de sesión exitoso",
        message: "Bienvenido de nuevo a PoliTinder.",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error al iniciar sesión",
        message: error?.message || "Ocurrió un error inesperado.",
      });
    }
  };

  const handleMicrosoftLogin = async () => {
    setAlert(null);
    try {
      await loginWithMicrosoft();
      setAlert({
        type: "success",
        title: "Inicio de sesión exitoso",
        message: "Bienvenido de nuevo a PoliTinder.",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error con Microsoft",
        message: error?.message || "No se pudo autenticar con Microsoft.",
      });
    }
  };

  return (
    <AuthFormSplitScreen
      title="Iniciar sesión"
      description="¡Bienvenido de nuevo! Por favor, ingresa para continuar."
      imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
      imageAlt="Estudiantes EPN"
      onSubmit={handleLogin}
      forgotPasswordHref="/forgot-password"
      createAccountHref="/register"
      serverAlert={alert}
      onMicrosoftClick={handleMicrosoftLogin}
    />
  );
}
