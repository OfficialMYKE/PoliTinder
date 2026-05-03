import { AuthFormSplitScreen } from "../components/ui/login";

// Función para simular el tiempo de carga
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Login() {
  // Manejador del formulario
  const handleLogin = async (data: any) => {
    console.log("Formulario enviado con:", data);
    await sleep(2000);
    alert("¡Inicio de sesión exitoso!");
  };

  return (
    <AuthFormSplitScreen
      title="Iniciar sesión"
      description="¡Bienvenido de nuevo! Por favor, ingresa para continuar."
      imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
      imageAlt="Estudiantes EPN"
      onSubmit={handleLogin}
      forgotPasswordHref="#"
      createAccountHref="/register"
    />
  );
}
