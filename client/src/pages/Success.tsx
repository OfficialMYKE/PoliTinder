import { useState, useEffect } from "react"
import { CheckCircle2, Crown, ArrowLeft, Loader2, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { verifyCheckoutSession } from "../services/premium"

export default function Success() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state } = useAuth()
  const [verifying, setVerifying] = useState(true)
  const [paid, setPaid] = useState(false)
  const [planName, setPlanName] = useState("")
  const [planId, setPlanId] = useState("")

  const PLAN_BENEFITS: Record<string, string[]> = {
    premium: [
      "Matches ilimitados",
      "Perfil destacado en descubrimiento",
      "Ver quién reaccionó a tu perfil",
      "Mensajes prioritarios",
      "Sin publicidad",
      "Soporte prioritario",
    ],
    premium_plus: [
      "Matches ilimitados",
      "Perfil destacado en descubrimiento",
      "Ver quién reaccionó a tu perfil",
      "Mensajes prioritarios",
      "Sin publicidad",
      "Acceso anticipado a nuevas funciones",
      "Badges exclusivos de perfil",
      "Análisis de compatibilidad avanzado",
      "Creación de grupos exclusivos",
      "Acceso a eventos VIP",
      "Soporte 24/7",
    ],
  }

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      setVerifying(false)
      return
    }

    async function verify() {
      try {
        const result = await verifyCheckoutSession(sessionId)
        setPaid(result.paid)
        if (result.planId) {
          setPlanId(result.planId)
          const names: Record<string, string> = {
            premium: "Premium",
            premium_plus: "Premium+",
          }
          setPlanName(names[result.planId] || result.planId)
        }
      } catch {
        setPaid(false)
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [searchParams])

  if (verifying) {
    return (
      <div className="flex flex-col min-h-full">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Verificando pago...
            </h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#487CFF]" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Confirmando tu pago con Stripe...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {paid ? "Pago Exitoso" : "Estado del Pago"}
          </h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md"
        >
          {paid ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                ¡Pago realizado!
              </h2>

              <p className="mt-3 text-slate-500 dark:text-zinc-400">
                Ahora eres usuario {planName}. Disfruta de todas las ventajas de tu nuevo plan.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#487CFF]/10 px-4 py-2 text-sm font-medium text-[#487CFF]">
                <Crown className="h-4 w-4" />
                PoliTinder {planName} Activo
              </div>

              {/* Benefits list */}
              {planId && PLAN_BENEFITS[planId] && (
                <div className="mt-8 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">
                    Tus nuevas ventajas:
                  </p>
                  <div className="space-y-2">
                    {PLAN_BENEFITS[planId].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-sm text-slate-600 dark:text-zinc-300">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-6">
                <Crown className="h-10 w-10 text-amber-500" />
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                Pago pendiente
              </h2>

              <p className="mt-3 text-slate-500 dark:text-zinc-400">
                Tu pago está siendo procesado. Si ya completaste el pago, tu premium se activará en unos minutos.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="inline-flex items-center gap-2 rounded-full bg-[#487CFF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a6ae0]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Feed
            </button>

            {!paid && (
              <button
                type="button"
                onClick={() => navigate("/premium")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-medium text-slate-600 dark:text-zinc-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700"
              >
                <Crown className="h-4 w-4" />
                Ver planes
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
