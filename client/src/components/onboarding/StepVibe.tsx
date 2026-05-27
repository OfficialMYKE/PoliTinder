import { useState } from "react"
import { Plus } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { OnboardingFormValues } from "../../schemas/onboardingSchema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form"
import { Textarea } from "../ui/textarea"
import { STUDY_STYLES, INTERESTS } from "../../data/academicData"

interface StepVibeProps {
  form: UseFormReturn<OnboardingFormValues>
  isSubmitting: boolean
}

export function StepVibe({ form, isSubmitting }: StepVibeProps) {
  const selectedStyles = form.watch("studyStyles") ?? []
  const selectedInterests = form.watch("interests") ?? []
  const bioLength = (form.watch("bio") ?? "").length

  const [customStyle, setCustomStyle] = useState("")
  const [customInterest, setCustomInterest] = useState("")

  function toggleArrayValue(field: "studyStyles" | "interests", value: string) {
    const current = form.getValues(field) ?? []
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    form.setValue(field, updated, { shouldValidate: false })
  }

  function addCustomStyle() {
    const trimmed = customStyle.trim()
    if (!trimmed) return
    const current = form.getValues("studyStyles") ?? []
    if (!current.includes(trimmed)) {
      form.setValue("studyStyles", [...current, trimmed], { shouldValidate: false })
    }
    setCustomStyle("")
  }

  function addCustomInterest() {
    const trimmed = customInterest.trim()
    if (!trimmed) return
    const current = form.getValues("interests") ?? []
    if (!current.includes(trimmed)) {
      form.setValue("interests", [...current, trimmed], { shouldValidate: false })
    }
    setCustomInterest("")
  }

  const allStyles = [
    ...STUDY_STYLES.map((s) => s.value),
    ...selectedStyles.filter((s) => !STUDY_STYLES.some((p) => p.value === s)),
  ]

  const allInterests = [
    ...INTERESTS.map((i) => i.value),
    ...selectedInterests.filter((i) => !INTERESTS.some((p) => p.value === i)),
  ]

  const styleLabel = (value: string) =>
    STUDY_STYLES.find((s) => s.value === value)?.label ?? value

  const interestLabel = (value: string) =>
    INTERESTS.find((i) => i.value === value)?.label ?? value

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Tu vibra
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Cuéntanos cómo eres estudiando y qué te apasiona.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-7">
        <Form {...form}>
          <FormField
            control={form.control}
            name="bio"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Mini bio</p>
                  <span className="text-xs text-slate-400">(opcional)</span>
                </div>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Escribe algo sobre ti..."
                      {...field}
                      disabled={isSubmitting}
                      maxLength={280}
                      rows={3}
                      className={`w-full resize-none rounded-2xl border bg-white p-3.5 pb-8 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                          : "border-slate-300 focus-visible:border-[#487CFF] focus-visible:ring-[#487CFF]"
                      }`}
                    />
                    <div className="absolute bottom-2 right-3 text-xs tabular-nums text-slate-400">
                      {bioLength}/280
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Estilo de estudio</p>
            <span className="text-xs text-slate-400">(opcional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allStyles.map((style) => {
              const isSelected = selectedStyles.includes(style)
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleArrayValue("studyStyles", style)}
                  disabled={isSubmitting}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-[#487CFF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm"
                  }`}
                >
                  {styleLabel(style)}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomStyle()
                }
              }}
              placeholder="Agregar estilo propio..."
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addCustomStyle}
              disabled={isSubmitting || !customStyle.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#487CFF] text-white transition-all duration-200 hover:bg-[#3a6ae0] disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Intereses</p>
            <span className="text-xs text-slate-400">(opcional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleArrayValue("interests", interest)}
                  disabled={isSubmitting}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-[#487CFF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm"
                  }`}
                >
                  {interestLabel(interest)}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomInterest()
                }
              }}
              placeholder="Agregar interés propio..."
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addCustomInterest}
              disabled={isSubmitting || !customInterest.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#487CFF] text-white transition-all duration-200 hover:bg-[#3a6ae0] disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
