"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { AuthFooter } from "./footer";
import { MicrosoftIcon } from "../icons/MicrosoftIcon";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import type { RegisterFormValues } from "../../schemas/registerSchema";
import { theme } from "../../config/theme";

interface RegisterFormSplitScreenProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  loginHref: string;
}

export function RegisterFormSplitScreen({
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  loginHref,
}: RegisterFormSplitScreenProps) {
  const {
    form,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
  } = useRegisterForm({ onSubmit });

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
      <div className="flex flex-1 flex-col items-center justify-center p-8 pb-26 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col min-h-full w-full p-8 pt-0">
          <div className="flex-1 flex flex-col items-center justify-center">
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
                    {title}
                  </h1>
                  <p className="text-sm text-slate-500">{description}</p>
                </motion.div>

                <motion.div variants={theme.animation.itemVariants}>
                  <Button
                    variant="outline"
                    className="w-full font-medium h-12 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100"
                    onClick={() => console.log("Microsoft Register")}
                  >
                    <MicrosoftIcon /> Registrarse con Microsoft
                  </Button>
                </motion.div>

                <motion.div
                  variants={theme.animation.itemVariants}
                  className="relative my-0"
                >
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
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                    autoComplete="off"
                  >
                    <motion.div
                      variants={theme.animation.itemVariants}
                      className="grid grid-cols-2 gap-4"
                    >
                      <NameField
                        form={form}
                        isLoading={isLoading}
                        name="firstName"
                        placeholder="Nombre"
                      />
                      <NameField
                        form={form}
                        isLoading={isLoading}
                        name="lastName"
                        placeholder="Apellido"
                      />
                    </motion.div>

                    <EmailField form={form} isLoading={isLoading} />
                    <PasswordField
                      form={form}
                      isLoading={isLoading}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                    <ConfirmPasswordField
                      form={form}
                      isLoading={isLoading}
                      showConfirmPassword={showConfirmPassword}
                      onTogglePassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                    <TermsField form={form} isLoading={isLoading} />
                    <SubmitButton isLoading={isLoading} text="Crear cuenta" />

                    <motion.p
                      variants={theme.animation.itemVariants}
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
                  </form>
                </Form>
              </motion.div>
            </div>
            <div className="w-full mt-8 flex items-center justify-center">
              <AuthFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate components for each form field - SRP
function NameField({
  form,
  isLoading,
  name,
  placeholder,
}: {
  form: any;
  isLoading: boolean;
  name: string;
  placeholder: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormControl>
            <div className="relative group">
              <User
                className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${
                  fieldState.error
                    ? "text-red-500"
                    : "text-slate-400 group-focus-within:text-[#487CFF]"
                }`}
              />
              <Input
                placeholder={placeholder}
                {...field}
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
  );
}

function EmailField({ form, isLoading }: { form: any; isLoading: boolean }) {
  return (
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
                autoComplete="off"
                {...field}
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
  );
}

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
                {...field}
                disabled={isLoading}
                className={`bg-white pl-12 h-12 rounded-full border focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors ${
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
  );
}

function ConfirmPasswordField({
  form,
  isLoading,
  showConfirmPassword,
  onTogglePassword,
}: {
  form: any;
  isLoading: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
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
                className={`bg-white pl-12 pr-12 h-12 rounded-full border-slate-300 focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
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
  );
}

function TermsField({ form, isLoading }: { form: any; isLoading: boolean }) {
  return (
    <motion.div variants={theme.animation.itemVariants} className="pt-1">
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
          <p className="text-[0.8rem] font-normal text-red-600 text-destructive">
            {form.formState.errors.acceptTerms.message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

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
