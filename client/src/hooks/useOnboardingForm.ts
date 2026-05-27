import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "../schemas/onboardingSchema"
import { uploadAvatar } from "../services/supabase"

interface UseOnboardingFormProps {
  onSubmit: (data: OnboardingFormValues) => Promise<void>
}

const STEP_FIELDS: (keyof OnboardingFormValues)[][] = [
  ["nickname"],
  ["faculty", "career"],
  [],
]

const OPTIONAL_FIELDS: (keyof OnboardingFormValues)[][] = [
  ["avatar"],
  ["semester", "lookingFor"],
  ["bio", "studyStyles", "interests"],
]

export function useOnboardingForm({ onSubmit }: UseOnboardingFormProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nickname: "",
      avatar: null,
      dateOfBirth: "",
      faculty: "",
      career: "",
      semester: null as string | null,
      lookingFor: [],
      bio: "",
      studyStyles: [],
      interests: [],
    },
  })

  const totalSteps = 3
  const hasSkippableStep = OPTIONAL_FIELDS[step].length > 0

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[step]

    if (fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }

    if (step === totalSteps - 1) {
      setIsSubmitting(true)
      try {
        await onSubmit(form.getValues())
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setDirection(1)
    setStep((s) => s + 1)
  }, [step, form, onSubmit])

  const goBack = useCallback(() => {
    if (step === 0) return
    setDirection(-1)
    setStep((s) => s - 1)
  }, [step])

  const skipStep = useCallback(() => {
    if (step >= totalSteps - 1) return
    setDirection(1)
    setStep((s) => s + 1)
  }, [step])

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep < 0 || targetStep >= totalSteps) return
    setDirection(targetStep > step ? 1 : -1)
    setStep(targetStep)
  }, [step])

  const uploadAvatarFile = useCallback(
    async (userId: string, file: File): Promise<string> => {
      setIsUploading(true)
      try {
        const url = await uploadAvatar(userId, file)
        form.setValue("avatar", url, { shouldValidate: false })
        return url
      } finally {
        setIsUploading(false)
      }
    },
    [form],
  )

  const reset = useCallback(() => {
    setStep(0)
    setDirection(0)
    setIsSubmitting(false)
    form.reset()
  }, [form])

  return {
    step,
    direction,
    form,
    isSubmitting,
    isUploading,
    totalSteps,
    hasSkippableStep,
    goNext,
    goBack,
    goToStep,
    skipStep,
    uploadAvatarFile,
    reset,
  }
}
