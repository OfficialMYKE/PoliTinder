import { AuthFormSplitScreen } from "../components/ui/login";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function Login() {

  const handleLogin = async (data: any) => {

    console.log(data);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("Usuario:", userCredential.user);

      alert("Inicio de sesión exitoso");

    } catch (error) {

      console.log(error);

      alert("Correo o contraseña incorrectos");
    }
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