import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Alert } from "../components/ui/alert"
import { StepIndicator } from "../components/onboarding/StepIndicator"
import { StepIdentity } from "../components/onboarding/StepIdentity"
import { StepAcademic } from "../components/onboarding/StepAcademic"
import { StepVibe } from "../components/onboarding/StepVibe"
import { useOnboardingForm } from "../hooks/useOnboardingForm"
import { createProfile, getProfile, mapOnboardingToProfile } from "../services/profile"
import type { OnboardingFormValues } from "../schemas/onboardingSchema"
import type { ServerAlert } from "../types/onboarding"
import type { IOnboardingStorage } from "../services/storage"

interface OnboardingProps {
  onboardingStorage: IOnboardingStorage
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
}

const STEPS_CONFIG = [
  { component: StepIdentity, key: "identity" },
  { component: StepAcademic, key: "academic" },
  { component: StepVibe, key: "vibe" },
]

export default function Onboarding({ onboardingStorage }: OnboardingProps) {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const [alert, setAlert] = useState<ServerAlert | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    if (!state.user?.id) {
      setCheckingProfile(false)
      return
    }
    getProfile(state.user.id)
      .then((existing) => {
        if (existing) {
          onboardingStorage.markCompleted()
          navigate("/feed", { replace: true })
          return
        }
        setCheckingProfile(false)
      })
      .catch(() => {
        setCheckingProfile(false)
      })
  }, [state.user?.id])

  async function handleSubmit(data: OnboardingFormValues) {
    setAlert(null)
    try {
      const profile = mapOnboardingToProfile(state.user!.id, data)
      await createProfile(profile)
      onboardingStorage.markCompleted()
      navigate("/welcome", { replace: true })
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Error desconocido"
      setAlert({
        type: "error",
        title: "Error al guardar tu perfil",
        message: `No pudimos guardar tu información: ${detail}`,
      })
    }
  }

  const {
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
  } = useOnboardingForm({ onSubmit: handleSubmit })

  if (!state.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Debes iniciar sesión para completar tu perfil.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-xl bg-[#487CFF] px-6 text-white"
          >
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    )
  }

  if (checkingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  if (onboardingStorage.isCompleted()) {
    navigate("/feed", { replace: true })
    return null
  }

  async function handleFileSelect(file: File) {
    try {
      await uploadAvatarFile(state.user!.id, file)
    } catch {
      setAlert({
        type: "error",
        title: "Error al subir la foto",
        message: "No pudimos subir tu foto. Intenta de nuevo.",
      })
    }
  }

  const CurrentStep = STEPS_CONFIG[step].component

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="w-24">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-slate-400 transition-colors duration-200 hover:text-[#487CFF]"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
          ) : null}
        </div>

        <span className="text-xs font-medium text-slate-300">
          Paso {step + 1} de {totalSteps}
        </span>

        <div className="w-24 flex justify-end">
          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="text-xs text-slate-400 transition-colors duration-200 hover:text-[#487CFF]"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center pt-2">
          <div className="w-full px-4">
            <StepIndicator
              currentStep={step}
              totalSteps={totalSteps}
              onStepClick={(index) => {
                if (index !== step) {
                  goToStep(index)
                }
              }}
            />
          </div>

          <div className="relative mt-8 w-full">
            {alert && (
              <div className="mb-6">
                <Alert
                  variant={alert.type}
                  title={alert.title}
                  description={alert.message}
                />
              </div>
            )}

            <div className="relative w-full min-h-[360px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={STEPS_CONFIG[step].key}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 w-full"
                >
                  <CurrentStep
                    form={form}
                    isSubmitting={isSubmitting}
                    isUploading={isUploading}
                    onFileSelect={handleFileSelect}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-50 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          {hasSkippableStep ? (
            <button
              type="button"
              onClick={skipStep}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-[#487CFF] disabled:opacity-50"
            >
              Omitir
            </button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            onClick={goNext}
            disabled={isSubmitting || isUploading}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#487CFF] px-6 text-sm text-white shadow-sm transition-all duration-200 hover:bg-[#3a6ae0] hover:shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Guardando...
              </span>
            ) : step === totalSteps - 1 ? (
              "Finalizar"
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
