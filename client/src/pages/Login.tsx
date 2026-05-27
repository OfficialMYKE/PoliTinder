import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFormSplitScreen } from "../components/ui/login";
import { useAuth } from "../contexts/AuthContext";
import { createStorageServices } from "../services/storage";
import loginImage from "../assets/login.webp";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithMicrosoft } = useAuth();
  const { onboardingStorage } = createStorageServices();
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const handleLogin = async (data: any) => {
    setAlert(null);
    try {
      onboardingStorage.reset();
      await login({ email: data.email, password: data.password });
      navigate("/", { replace: true });
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
      navigate("/", { replace: true });
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
      imageSrc={loginImage}
      imageAlt="Estudiantes EPN"
      onSubmit={handleLogin}
      forgotPasswordHref="/forgot-password"
      createAccountHref="/register"
      serverAlert={alert}
      onMicrosoftClick={handleMicrosoftLogin}
    />
  );
}
