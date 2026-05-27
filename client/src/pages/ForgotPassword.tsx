import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { AuthFooter } from "../components/ui/footer";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../config/theme";
import forgotImage from "../assets/login.webp";

/**
 * Página de recuperación de contraseña
 * Envía un enlace de restablecimiento al correo institucional del usuario
 */
export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const handleReset = async (data: { email: string }) => {
    setAlert(null);
    try {
      await resetPassword(data.email);
      setAlert({
        type: "success",
        title: "Correo enviado",
        message:
          "Se ha enviado un enlace de restauración a tu correo institucional. Revisa tu bandeja de entrada o la carpeta de spam.",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error al enviar el correo",
        message:
          error?.message ||
          "No se pudo enviar el correo de recuperación. Intenta de nuevo.",
      });
    }
  };

  const { form, isLoading, handleSubmit } = useForgotPasswordForm({
    onSubmit: handleReset,
  });

  return (
    <div className="fixed inset-0 flex w-full flex-col md:flex-row overflow-hidden bg-white">
      {/* Imagen decorativa con gradiente — oculta en dispositivos móviles */}
      <div className="relative hidden w-1/2 md:block">
        <img
          src={forgotImage}
          alt="Estudiantes EPN"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Formulario de recuperación con scroll */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 pb-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col min-h-full w-full p-8 pt-12">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <motion.div
                variants={theme.animation.containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6"
              >
                <motion.div
                  variants={theme.animation.itemVariants}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                    Recuperar contraseña
                  </h1>
                  <p className="text-sm text-slate-500">
                    Ingresa tu correo institucional y te enviaremos un enlace
                    para restablecer tu contraseña.
                  </p>
                </motion.div>

                {/* Alerta del servidor */}
                {alert && (
                  <motion.div variants={theme.animation.itemVariants}>
                    <Alert
                      variant={alert.type}
                      title={alert.title}
                      description={alert.message}
                    />
                  </motion.div>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                    autoComplete="off"
                  >
                    <motion.div variants={theme.animation.itemVariants}>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group">
                                <Mail
                                  className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${
                                    fieldState.error
                                      ? "text-red-500"
                                      : "text-slate-400 group-focus-within:text-[#487CFF]"
                                  }`}
                                />
                                <Input
                                  placeholder="Correo institucional (@epn.edu.ec)"
                                  autoComplete="email"
                                  {...field}
                                  disabled={isLoading}
                                  className={`bg-white pl-12 h-12 rounded-full border focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors ${
                                    fieldState.error
                                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                                      : "border-slate-300 focus-visible:border-[#487CFF] focus-visible:ring-[#487CFF]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      variants={theme.animation.itemVariants}
                      className="pt-2"
                    >
                      <Button
                        type="submit"
                        style={{ backgroundColor: theme.colors.primary }}
                        className="w-full h-12 rounded-full text-white font-medium text-base shadow-sm hover:opacity-90 transition-opacity"
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Enviar enlace
                      </Button>
                    </motion.div>

                    <motion.p
                      variants={theme.animation.itemVariants}
                      className="px-8 text-center text-sm text-slate-600 mt-4"
                    >
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 font-normal text-[#487CFF] hover:underline"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Volver al inicio de sesión
                      </Link>
                    </motion.p>
                  </form>
                </Form>
              </motion.div>
            </div>
          </div>
          <div className="w-full mt-82 flex items-center justify-center pb-4">
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
