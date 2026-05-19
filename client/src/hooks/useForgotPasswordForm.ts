import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "../schemas/forgotPasswordSchema";

interface UseForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => Promise<void>;
}

export function useForgotPasswordForm({
  onSubmit,
}: UseForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleSubmit,
  };
}
