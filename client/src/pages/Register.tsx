import { RegisterFormSplitScreen } from "../components/ui/register";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Register() {
  const handleRegister = async (data: any) => {
    console.log("Datos de registro:", data);
    await sleep(2000); // Simulamos carga
    alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
  };

  return (
    <RegisterFormSplitScreen
      title="Crear cuenta"
      description="Únete a la comunidad de PoliTinder y encuentra tu grupo de estudio."
      imageSrc="https://media.istockphoto.com/id/1588289974/es/foto/grupo-multirracial-de-estudiantes-felices-en-la-sala-de-conferencias-mirando-a-la-c%C3%A1mara.jpg?b=1&s=1024x1024&w=0&k=20&c=JxjVBKNMNgX8APVq9bPE91V6iOTTghIgmJIcwreFI4Y="
      imageAlt="Estudiantes EPN"
      onSubmit={handleRegister}
      loginHref="/login"
    />
  );
}
