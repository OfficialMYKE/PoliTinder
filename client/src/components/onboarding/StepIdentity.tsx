import { useRef } from "react"
import { Camera, Loader2, Check, Calendar } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { OnboardingFormValues } from "../../schemas/onboardingSchema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"

interface StepIdentityProps {
  form: UseFormReturn<OnboardingFormValues>
  isUploading: boolean
  onFileSelect: (file: File) => void
}

const inputBase = "bg-white h-12 w-full rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"

function inputClasses(error: boolean, filled: boolean) {
  if (error) return `${inputBase} border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500`
  if (filled) return `${inputBase} border-slate-300 focus-visible:border-[#487CFF] focus-visible:ring-[#487CFF]`
  return `${inputBase} border-slate-300 focus-visible:border-[#487CFF] focus-visible:ring-[#487CFF]`
}

export function StepIdentity({
  form,
  isUploading,
  onFileSelect,
}: StepIdentityProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const avatarUrl = form.watch("avatar")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          ¿Quién eres?
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Tu foto y tu apodo para que los demás te reconozcan.
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-50 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-lg hover:ring-[#487CFF]/30"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            {isUploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            ) : (
              <>
                <Camera className="h-6 w-6 text-slate-400 transition-colors group-hover:text-[#487CFF]" />
                <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-[#487CFF]">
                  Foto
                </span>
              </>
            )}
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-full max-w-sm">
        <Form {...form}>
          <form className="space-y-5">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="relative group">
                    <FormControl>
                      <Input
                        placeholder="¿Cómo te gusta que te digan?"
                        autoComplete="off"
                        {...field}
                        disabled={isUploading}
                        className={`pl-4 ${inputClasses(!!fieldState.error, !!field.value)}`}
                      />
                    </FormControl>
                    {field.value && !fieldState.error && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Fecha de nacimiento</p>
                    <span className="text-xs text-slate-400">(opcional)</span>
                  </div>
                  <FormControl>
                    <div
                      onClick={() => dateRef.current?.showPicker()}
                      className={`group relative h-12 cursor-pointer rounded-full border bg-white transition-colors focus-within:ring-1 focus-within:ring-offset-0 ${
                        fieldState.error
                          ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
                          : "border-slate-300 focus-within:border-[#487CFF] focus-within:ring-[#487CFF] hover:border-slate-400"
                      }`}
                    >
                      <Calendar className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#487CFF]" />
                      <input
                        ref={dateRef}
                        type="date"
                        {...field}
                        disabled={isUploading}
                        className="h-full w-full appearance-none bg-transparent pl-11 pr-4 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
