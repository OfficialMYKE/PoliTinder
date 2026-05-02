"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

// Rutas relativas
import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { cn } from "../../lib/utils";

// Validación en español
const formSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  rememberMe: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormSplitScreenProps {
  logo: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: FormValues) => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
}

// Icono oficial de Microsoft
const MicrosoftIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="microsoft"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
  >
    <path fill="#f25022" d="M0 32h214.7v214.7H0V32z"></path>
    <path fill="#7fbb00" d="M233.3 32H448v214.7H233.3V32z"></path>
    <path fill="#00a4ef" d="M0 265.3h214.7V480H0V265.3z"></path>
    <path fill="#ffb900" d="M233.3 265.3H448V480H233.3V265.3z"></path>
  </svg>
);

export function AuthFormSplitScreen({
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  forgotPasswordHref,
  createAccountHref,
}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  // Estado para controlar si se ve o no la contraseña
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="fixed inset-0 flex w-full flex-col md:flex-row overflow-hidden bg-white">
      {/* Panel Izquierdo */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md md:-mt-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center text-center"
            >
              <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                {title}
              </h1>
              <p className="text-sm text-slate-500">{description}</p>
            </motion.div>

            {/* Microsoft botón */}
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                className="w-full font-medium h-12 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100"
                onClick={() => console.log("Microsoft")}
              >
                <MicrosoftIcon /> Continuar con Microsoft
              </Button>
            </motion.div>

            {/* Separador */}
            <motion.div variants={itemVariants} className="relative my-0">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  o inicia sesión con correo
                </span>
              </div>
            </motion.div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-5"
                autoComplete="off"
              >
                {/* Input de Correo */}
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                            <Input
                              placeholder="Correo institucional"
                              autoComplete="off"
                              {...field}
                              disabled={isLoading}
                              className="bg-white pl-12 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* Input de Contraseña */}
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Contraseña"
                              autoComplete="new-password"
                              {...field}
                              disabled={isLoading}
                              className="bg-white pl-12 pr-12 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none group-focus-within:text-[#487CFF]"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between px-1"
                >
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label
                            translate="no"
                            className="font-normal cursor-pointer text-sm text-slate-600"
                          >
                            Recordarme
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />
                  <a
                    href={forgotPasswordHref}
                    className="text-sm font-normal text-[#487CFF] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#487CFF] hover:bg-blue-700 text-white font-medium text-base shadow-sm"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Iniciar sesión
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.p
              variants={itemVariants}
              className="px-8 text-center text-sm text-slate-600 mt-4"
            >
              ¿No tienes una cuenta?{" "}
              <a
                href={createAccountHref}
                className="font-normal text-[#487CFF] hover:underline"
              >
                Crea una aquí
              </a>
            </motion.p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-8 w-full text-center text-xs text-slate-400 md:absolute md:bottom-6 md:mt-0">
          <p>© 2026 PoliTinder. Todos los derechos reservados.</p>
          <div className="mt-1 space-x-3">
            <a href="#" className="hover:text-slate-600 transition-colors">
              Términos de uso
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacidad
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Soporte
            </a>
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="relative hidden w-1/2 md:block">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}
