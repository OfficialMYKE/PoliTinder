import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import type { IOnboardingStorage } from "../services/storage"

interface WelcomeProps {
  onboardingStorage: IOnboardingStorage
}

const TUTORIAL_STEPS = [
  {
    title: "Encuentra tu match académico",
    description:
      "Conecta con estudiantes de tu misma facultad, carrera e intereses. El algoritmo ideal para encontrar con quién estudiar y colaborar.",
  },
  {
    title: "Chatea en tiempo real",
    description:
      "Mensajería instantánea con tus matches para coordinar estudios, proyectos o simplemente conocer a tu comunidad politécnica.",
  },
  {
    title: "Forma grupos de estudio",
    description:
      "Crea o únete a grupos por materia o proyecto. Resuelvan dudas juntos y lleguen mejor preparados a los exámenes.",
  },
  {
    title: "Sé mentor o encuentra mentor",
    description:
      "Comparte tu experiencia con estudiantes de semestres anteriores o encuentra a alguien que te guíe en tu vida universitaria.",
  },
]

export default function Welcome({ onboardingStorage }: WelcomeProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const isLastStep = step === TUTORIAL_STEPS.length - 1
  const current = TUTORIAL_STEPS[step]

  function handleNext() {
    if (isLastStep) {
      navigate("/profile", { replace: true })
      return
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  function handleBack() {
    if (step === 0) return
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function skipAll() {
    navigate("/profile", { replace: true })
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <header className="flex items-center justify-between px-5 py-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-[#487CFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={skipAll}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-[#487CFF]"
        >
          Saltar
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative mb-8 w-full max-w-xs">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-100" />
          <motion.div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#487CFF]"
            initial={false}
            animate={{ width: `${(step / (TUTORIAL_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="flex justify-between">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`relative z-10 h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-[#487CFF]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction < 0 ? 60 : -60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">
              {current.title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="border-t border-slate-100 bg-white px-8 py-6">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
          <Button
            type="button"
            onClick={handleNext}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#487CFF] text-sm text-white shadow-sm transition-all duration-200 hover:bg-[#3a6ae0]"
          >
            {isLastStep ? (
              "Comenzar"
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {!isLastStep && (
            <button
              type="button"
              onClick={skipAll}
          className="text-sm font-medium text-slate-400 transition-colors hover:text-[#487CFF]"
            >
              Omitir tutorial
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
