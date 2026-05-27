const STEPS = [
  { label: "Identidad", subtitle: "Tu foto y nombre" },
  { label: "Académico", subtitle: "Tu facultad y carrera" },
  { label: "Vibra", subtitle: "Tu estilo de estudio" },
]

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  onStepClick?: (stepIndex: number) => void
}

export function StepIndicator({ currentStep, totalSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.slice(0, totalSteps).map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const canClick = onStepClick && (isCompleted || index <= currentStep)

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onStepClick(index)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#487CFF] text-white cursor-pointer hover:bg-[#3a6ae0] hover:shadow-md"
                    : isActive
                      ? "bg-[#487CFF] text-white shadow-md"
                      : canClick
                        ? "bg-slate-100 text-slate-400 cursor-pointer hover:bg-slate-200"
                        : "bg-slate-50 text-slate-300 cursor-default"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>

              <span
                className={`mt-1.5 text-[10px] font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? "text-slate-900"
                    : isCompleted
                      ? "text-[#487CFF]"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < totalSteps - 1 && (
              <div className={`mx-2 mb-5 h-px w-12 sm:w-16 transition-colors duration-300 ${
                isCompleted ? "bg-[#487CFF]" : "bg-slate-100"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
