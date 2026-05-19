import { AuthFormSplitScreen } from "../components/ui/login";
import { useAuth } from "../contexts/AuthContext";

/**
 * Página de Login.
 * Actúa como controlador de alto nivel, conectando el UI con el contexto de autenticación global.
 */
export default function Login() {
  const { login } = useAuth(); // Extraemos la función de login del contexto

  /**
   * Ejecuta la autenticación cuando el formulario se envía correctamente.
   */
  const handleLogin = async (data: any) => {
    await login({ email: data.email, password: data.password });
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
