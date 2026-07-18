import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Crown } from "lucide-react"

interface PricingPlan {
  id: string
  name: string
  price: string
  priceFrequency: string
  description: string
  features: string[]
  ctaText: string
  isFeatured?: boolean
  isCurrent?: boolean
  disabled?: boolean
}

interface PricingCardProps {
  plan: PricingPlan
  onSelect: (planId: string) => void
}

export function PricingCard({ plan, onSelect }: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex flex-col h-full p-8 rounded-2xl border transition-colors ${
        plan.isFeatured
          ? "border-[#487CFF] bg-white dark:bg-zinc-900 shadow-md ring-1 ring-[#487CFF]/20"
          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
      }`}
    >
      {plan.isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#487CFF] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white whitespace-nowrap">
          <Crown className="h-3.5 w-3.5" />
          Más Popular
        </div>
      )}

      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          {plan.description}
        </p>

        <div className="mt-6 flex items-baseline gap-1">
          {plan.price !== "0" && (
            <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">$</span>
          )}
          <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            {plan.price}
          </span>
          {plan.priceFrequency && (
            <span className="ml-1 text-base font-medium text-slate-500 dark:text-zinc-400">
              {plan.priceFrequency}
            </span>
          )}
        </div>

        <ul className="mt-8 space-y-3.5">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#487CFF]" />
              <span className="text-sm text-slate-600 dark:text-zinc-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {plan.isCurrent ? (
          <div className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full text-sm font-medium bg-[#487CFF]/10 text-[#487CFF]">
            Plan Actual
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(plan.id)}
            disabled={plan.disabled}
            className={`inline-flex items-center justify-center w-full px-5 py-3 rounded-full text-sm font-semibold transition-colors ${
              plan.isFeatured
                ? "bg-[#487CFF] text-white hover:bg-[#3a6ae0]"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700"
            } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {plan.ctaText}
            {!plan.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        )}
      </div>
    </motion.div>
  )
}
