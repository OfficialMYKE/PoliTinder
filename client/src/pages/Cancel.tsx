import { CircleX, ArrowLeft, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function Cancel() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Pago Cancelado
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 mb-6">
            <CircleX className="h-10 w-10 text-red-500" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
            Pago cancelado
          </h2>

          <p className="mt-3 text-slate-500 dark:text-zinc-400">
            No se realizó ningún cargo. Puedes intentar de nuevo cuando quieras.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/premium")}
              className="inline-flex items-center gap-2 rounded-full bg-[#487CFF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a6ae0]"
            >
              <RotateCcw className="h-4 w-4" />
              Intentar de nuevo
            </button>

            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-medium text-slate-600 dark:text-zinc-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Feed
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
