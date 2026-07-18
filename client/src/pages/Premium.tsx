import { useState, useEffect } from "react"
import { Crown, Loader2, Sparkles, Shield, Zap, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { PricingCard } from "../components/ui/pricing-card"
import {
  PREMIUM_PLANS,
  createCheckoutSession,
  getUserPremiumStatus,
} from "../services/premium"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function Premium() {
  const { state } = useAuth()
  const user = state.user
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStatus() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      const status = await getUserPremiumStatus(user.id)
      setCurrentPlan(status.plan)
      setLoading(false)
    }
    loadStatus()
  }, [user?.id])

  async function handleSelectPlan(planId: string) {
    if (!user?.id || planId === "basic") return

    setError(null)
    setPurchasing(planId)

    try {
      const url = await createCheckoutSession(user.id, planId)
      window.location.href = url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al procesar el pago"
      setError(message)
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Premium
          </h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#487CFF]/10 mb-6">
              <Crown className="h-8 w-8 text-[#487CFF]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Desbloquea tu potencial
            </h2>
            <p className="mt-3 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Conecta con más compañeros, destaca tu perfil y lleva tu experiencia
              académica al siguiente nivel.
            </p>
          </motion.div>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 mx-auto max-w-lg"
            >
              <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Verifica que el servidor de pagos esté activo e intenta de nuevo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* Benefits highlight */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: Sparkles,
                title: "Destaca tu perfil",
                desc: "Aparece primero en las recomendaciones de matches.",
              },
              {
                icon: Zap,
                title: "Matches ilimitados",
                desc: "Conecta sin límites con compañeros de tu facultad.",
              },
              {
                icon: Shield,
                title: "Experiencia premium",
                desc: "Sin publicidad, badges exclusivos y soporte 24/7.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#487CFF]/10">
                  <benefit.icon className="h-5 w-5 text-[#487CFF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {benefit.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Pricing Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PREMIUM_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={{
                  ...plan,
                  price: plan.price === 0 ? "0" : String(plan.price),
                  isCurrent: currentPlan === plan.id || (plan.id === "basic" && !currentPlan),
                }}
                onSelect={handleSelectPlan}
              />
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div variants={itemVariants} className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 text-center mb-6">
              Preguntas frecuentes
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: "¿Puedo cancelar en cualquier momento?",
                  a: "Sí, puedes cancelar tu suscripción cuando quieras. Seguirás teniendo acceso Premium hasta finalizar el período pagado.",
                },
                {
                  q: "¿Qué métodos de pago aceptan?",
                  a: "Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe, un procesador de pagos seguro y confiable.",
                },
                {
                  q: "¿Hay descuentos para estudiantes?",
                  a: "¡Sí! Los precios ya están pensados para ser accesibles para estudiantes universitarios.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {faq.q}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Loading overlay when purchasing */}
      {purchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-[#487CFF]" />
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Redirigiendo al pago seguro...
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Serás redirigido a Stripe para completar tu compra
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
