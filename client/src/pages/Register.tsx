import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterFormSplitScreen } from "../components/ui/register";
import { useAuth } from "../contexts/AuthContext";
import { createStorageServices } from "../services/storage";
import registerImage from "../assets/login.webp";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithMicrosoft } = useAuth();
  const { onboardingStorage } = createStorageServices();
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const handleRegister = async (data: any) => {
    setAlert(null);
    try {
      onboardingStorage.reset();
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      navigate("/", { replace: true });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error al registrarse",
        message: error?.message || "Ocurrió un error inesperado.",
      });
    }
  };

  const handleMicrosoftRegister = async () => {
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
    <RegisterFormSplitScreen
      title="Crear cuenta"
      description="Únete a la comunidad de PoliTinder y encuentra tu grupo de estudio."
      imageSrc={registerImage}
      imageAlt="Estudiantes EPN"
      onSubmit={handleRegister}
      loginHref="/login"
      serverAlert={alert}
      onMicrosoftClick={handleMicrosoftRegister}
    />
  );
}
