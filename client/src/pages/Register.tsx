import { useState } from "react";
import { RegisterFormSplitScreen } from "../components/ui/register";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register, loginWithMicrosoft } = useAuth();
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const handleRegister = async (data: any) => {
    setAlert(null);
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setAlert({
        type: "success",
        title: "Cuenta creada",
        message: "Tu cuenta se ha creado exitosamente. ¡Bienvenido a PoliTinder!",
      });
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
      setAlert({
        type: "success",
        title: "Registro exitoso",
        message: "Tu cuenta se ha creado con Microsoft.",
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
    <RegisterFormSplitScreen
      title="Crear cuenta"
      description="Únete a la comunidad de PoliTinder y encuentra tu grupo de estudio."
      imageSrc="https://media.istockphoto.com/id/1588289974/es/foto/grupo-multirracial-de-estudiantes-felices-en-la-sala-de-conferencias-mirando-a-la-c%C3%A1mara.jpg?b=1&s=1024x1024&w=0&k=20&c=JxjVBKNMNgX8APVq9bPE91V6iOTTghIgmJIcwreFI4Y="
      imageAlt="Estudiantes EPN"
      onSubmit={handleRegister}
      loginHref="/login"
      serverAlert={alert}
      onMicrosoftClick={handleMicrosoftRegister}
    />
  );
}
