"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link } from "react-router-dom";

// Rutas relativas
import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { AuthFooter } from "./footer";

const formSchema = z
  .object({
    firstName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    lastName: z.string().min(2, { message: "Mínimo 2 caracteres." }),
    email: z.string().email({ message: "Ingresa un correo válido." }),
    password: z.string().min(8, { message: "Mínimo 8 caracteres." }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

interface RegisterFormSplitScreenProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: FormValues) => Promise<void>;
  loginHref: string;
}

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

export function RegisterFormSplitScreen({
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  loginHref,
}: RegisterFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
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
      {/* PANEL DERECHO */}
      <div className="relative hidden w-1/2 md:block">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* PANEL IZQUIERDO */}
      <div className="relative flex h-full w-full flex-col bg-white md:w-1/2">
        {/* CONTENEDOR DEL FORMULARIO */}
        <div className="flex flex-1 flex-col items-center justify-center p-8 pb-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-md">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6"
            >
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center text-center"
              >
                <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                  {title}
                </h1>
                <p className="text-sm text-slate-500">{description}</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="w-full font-medium h-12 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100"
                  onClick={() => console.log("Microsoft Register")}
                >
                  <MicrosoftIcon /> Registrarse con Microsoft
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative my-0">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">
                    o regístrate con correo
                  </span>
                </div>
              </motion.div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-5"
                  autoComplete="off"
                >
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                              <Input
                                placeholder="Nombre"
                                {...field}
                                disabled={isLoading}
                                className="bg-white pl-10 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                              <Input
                                translate="no"
                                placeholder="Apellido"
                                {...field}
                                disabled={isLoading}
                                className="bg-white pl-10 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

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
                                placeholder="Correo institucional (@epn.edu.ec)"
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
                                {...field}
                                disabled={isLoading}
                                className="bg-white pl-12 pr-12 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none group-focus-within:text-[#487CFF]"
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

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                {...field}
                                disabled={isLoading}
                                className="bg-white pl-12 pr-12 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none group-focus-within:text-[#487CFF]"
                              >
                                {showConfirmPassword ? (
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

                  <motion.div variants={itemVariants} className="pt-1">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 px-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label className="text-sm text-slate-600 font-normal">
                              Acepto los{" "}
                              <Link
                                to="#"
                                className="font-normal text-[#487CFF] hover:underline"
                              >
                                Términos
                              </Link>{" "}
                              y la{" "}
                              <Link
                                to="#"
                                className="font-normal text-[#487CFF] hover:underline"
                              >
                                Política
                              </Link>
                              .
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="px-1 mt-1">
                      {form.formState.errors.acceptTerms && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                          {form.formState.errors.acceptTerms.message}
                        </p>
                      )}
                    </div>
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
                      Crear cuenta
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <motion.p
                variants={itemVariants}
                className="px-8 text-center text-sm text-slate-600 mt-4"
              >
                ¿Ya tienes una cuenta?{" "}
                <Link
                  to={loginHref}
                  className="font-normal text-[#487CFF] hover:underline"
                >
                  Inicia sesión aquí
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* FOOTER */}
        <AuthFooter />
      </div>
    </div>
  );
}
