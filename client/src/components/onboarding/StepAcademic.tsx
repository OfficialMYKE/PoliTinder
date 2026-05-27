import { type ReactNode } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { OnboardingFormValues } from "../../schemas/onboardingSchema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form"
import {
  FACULTIES,
  getSemesterOptions,
  LOOKING_FOR_OPTIONS,
} from "../../data/academicData"
import { Combobox } from "../ui/combobox"

interface StepAcademicProps {
  form: UseFormReturn<OnboardingFormValues>
  isSubmitting: boolean
}

function FieldGroup({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {optional && <span className="text-xs text-slate-400">(opcional)</span>}
      </div>
      {children}
    </div>
  )
}

export function StepAcademic({ form, isSubmitting }: StepAcademicProps) {
  const selectedFaculty = form.watch("faculty")
  const selectedCareer = form.watch("career")
  const careers = FACULTIES.find((f) => f.value === selectedFaculty)?.careers ?? []
  const semesterOptions = getSemesterOptions(selectedCareer)
  const selectedLookingFor = form.watch("lookingFor") ?? []

  const facultyOptions = FACULTIES.map((f) => ({
    value: f.value,
    label: f.label,
  }))

  const careerOptions = careers.map((c) => ({
    value: c.value,
    label: c.label,
  }))

  function toggleLookingFor(value: string) {
    const updated = selectedLookingFor.includes(value)
      ? selectedLookingFor.filter((s) => s !== value)
      : [...selectedLookingFor, value]
    form.setValue("lookingFor", updated, { shouldValidate: false })
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Tu vida politécnica
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Tu facultad y carrera son clave para encontrar a los estudiantes ideales.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <Form {...form}>
          <FormField
            control={form.control}
            name="faculty"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Combobox
                    options={facultyOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      form.setValue("career", "", { shouldValidate: false })
                      form.setValue("semester", null, { shouldValidate: false })
                    }}
                    placeholder="Facultad"
                    disabled={isSubmitting}
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="career"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Combobox
                    options={careerOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      form.setValue("semester", null, { shouldValidate: false })
                    }}
                    placeholder={
                      selectedFaculty
                        ? "Carrera"
                        : "Selecciona una facultad primero"
                    }
                    disabled={isSubmitting || !selectedFaculty}
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Combobox
                    options={semesterOptions}
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val || null)}
                    placeholder={
                      selectedCareer
                        ? "Semestre (opcional)"
                        : "Selecciona una carrera primero"
                    }
                    disabled={isSubmitting || !selectedCareer}
                    clearable
                    searchable={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>

        <FieldGroup
          label="¿Qué buscas en PoliTinder?"
          optional
        >
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map((opt) => {
              const isSelected = selectedLookingFor.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleLookingFor(opt.value)}
                  disabled={isSubmitting}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-[#487CFF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </FieldGroup>
      </div>
    </div>
  )
}
