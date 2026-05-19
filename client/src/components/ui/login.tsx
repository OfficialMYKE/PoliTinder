"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "./button";
import { Alert } from "./alert";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { AuthFooter } from "./footer";
import { MicrosoftIcon } from "../icons/MicrosoftIcon";
import { useLoginForm } from "../../hooks/useLoginForm";
import type { LoginFormValues } from "../../schemas/loginSchema";
import { theme } from "../../config/theme";

interface ServerAlert {
  type: "error" | "success";
  title: string;
  message: string;
}

interface AuthFormSplitScreenProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
  serverAlert?: ServerAlert | null;
  onMicrosoftClick?: () => void;
}

/**
 * Componente de inicio de sesión con pantalla dividida
 * Panel izquierdo: imagen decorativa | Panel derecho: formulario de autenticación
 */
export function AuthFormSplitScreen({
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  forgotPasswordHref,
  createAccountHref,
  serverAlert = null,
  onMicrosoftClick,
}: AuthFormSplitScreenProps) {
  const { form, isLoading, showPassword, setShowPassword, handleSubmit } =
    useLoginForm({ onSubmit });

  return (
    <div className="fixed inset-0 flex w-full flex-col md:flex-row overflow-hidden bg-white">
      {/* Imagen decorativa con gradiente — oculta en dispositivos móviles */}
      <div className="relative hidden w-1/2 md:block">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Formulario de autenticación con scroll */}
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
                {/* Título y descripción de la pantalla */}
                <motion.div
                  variants={theme.animation.itemVariants}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                    {title}
                  </h1>
                  <p className="text-sm text-slate-500">{description}</p>
                </motion.div>

                {/* Autenticación con Microsoft OAuth */}
                <motion.div variants={theme.animation.itemVariants}>
                  <Button
                    variant="outline"
                    className="w-full font-medium h-12 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100"
                    onClick={onMicrosoftClick}
                  >
                    <MicrosoftIcon /> Continuar con Microsoft
                  </Button>
                </motion.div>

                {/* Separador visual entre OAuth y formulario */}
                <motion.div
                  variants={theme.animation.itemVariants}
                  className="relative my-0"
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">
                      o inicia sesión con correo
                    </span>
                  </div>
                </motion.div>

                {/* Alertas del servidor (error/success) */}
                {serverAlert && (
                  <motion.div variants={theme.animation.itemVariants}>
                    <Alert
                      variant={serverAlert.type}
                      title={serverAlert.title}
                      description={serverAlert.message}
                    />
                  </motion.div>
                )}

                {/* Formulario gestionado por React Hook Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                    autoComplete="off"
                  >
                    <EmailField form={form} isLoading={isLoading} />
                    <PasswordField
                      form={form}
                      isLoading={isLoading}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                    <RememberMeField form={form} isLoading={isLoading} />
                    <SubmitButton isLoading={isLoading} text="Iniciar sesión" />

                    {/* Enlace a la pantalla de registro */}
                    <motion.p
                      variants={theme.animation.itemVariants}
                      className="px-8 text-center text-sm text-slate-600 mt-4"
                    >
                      ¿No tienes una cuenta?{" "}
                      <Link
                        to={createAccountHref}
                        className="font-normal text-[#487CFF] hover:underline"
                      >
                        Crea una aquí
                      </Link>
                    </motion.p>
                  </form>
                </Form>
              </motion.div>
            </div>
          </div>
          <div className="w-full mt-31 flex items-center justify-center pb-4">
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Campo de correo electrónico institucional con icono y validación en tiempo real
 */
function EmailField({ form, isLoading }: { form: any; isLoading: boolean }) {
  return (
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
                  placeholder="Correo institucional"
                  autoComplete="off"
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
  );
}

/**
 * Campo de contraseña con toggle de visibilidad y validación en tiempo real
 */
function PasswordField({
  form,
  isLoading,
  showPassword,
  onTogglePassword,
}: {
  form: any;
  isLoading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <motion.div variants={theme.animation.itemVariants}>
      <FormField
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${
                    fieldState.error
                      ? "text-red-500"
                      : "text-slate-400 group-focus-within:text-[#487CFF]"
                  }`}
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  {...field}
                  disabled={isLoading}
                  className={`bg-white pl-12 pr-12 h-12 rounded-full border focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors ${
                    fieldState.error
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      : "border-slate-300 focus-visible:border-[#487CFF] focus-visible:ring-[#487CFF]"
                  }`}
                />

                <button
                  type="button"
                  onClick={onTogglePassword}
                  className={`absolute right-4 top-3.5 transition-colors focus:outline-none ${
                    fieldState.error
                      ? "text-red-500 hover:text-red-600"
                      : "text-slate-400 hover:text-slate-600 group-focus-within:text-[#487CFF]"
                  }`}
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
  );
}

/**
 * Checkbox "Recordarme" y enlace de recuperación de contraseña
 */
function RememberMeField({
  form,
  isLoading,
}: {
  form: any;
  isLoading: boolean;
}) {
  return (
    <motion.div
      variants={theme.animation.itemVariants}
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
      <Link
        to="/forgot-password"
        className="text-sm font-normal text-[#487CFF] hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </motion.div>
  );
}

/**
 * Botón de envío del formulario con indicador de carga
 */
function SubmitButton({
  isLoading,
  text,
}: {
  isLoading: boolean;
  text: string;
}) {
  return (
    <motion.div variants={theme.animation.itemVariants} className="pt-2">
      <Button
        type="submit"
        style={{
          backgroundColor: theme.colors.primary,
        }}
        className="w-full h-12 rounded-full text-white font-medium text-base shadow-sm hover:opacity-90 transition-opacity"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {text}
      </Button>
    </motion.div>
  );
}
