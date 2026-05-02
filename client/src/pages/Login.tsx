import { AuthFormSplitScreen } from "@/components/ui/login";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Login() {
  const handleLogin = async (data: any) => {
    console.log("Form submitted with:", data);
    await sleep(2000);
    alert("Login successful!");
  };

  return (
    <AuthFormSplitScreen
      logo={
        <img
          src={"../src/assets/logo.png"}
          alt="PoliTinder Logo"
          className="h-12 w-auto rounded-xl"
        />
      }
      title="Bienvenido a PoliTinder"
      description="Ingresa con tu correo @epn.edu.ec"
      imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
      imageAlt="Estudiantes EPN"
      onSubmit={handleLogin}
      forgotPasswordHref="#"
      createAccountHref="#"
    />
  );
}
