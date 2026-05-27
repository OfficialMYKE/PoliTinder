import { useRef, useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  searchable?: boolean
  clearable?: boolean
  emptyMessage?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  error = false,
  searchable = true,
  clearable = false,
  emptyMessage = "Sin resultados",
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options

  const selectedLabel = options.find((o) => o.value === value)?.label

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val)
      setOpen(false)
    },
    [onChange],
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange("")
    },
    [onChange],
  )

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen((o) => !o)
        }}
        disabled={disabled}
        className={cn(
          "relative flex h-12 w-full items-center rounded-full border bg-white px-4 text-sm transition-colors",
          error
            ? "border-red-500"
            : open
              ? "border-[#487CFF] ring-1 ring-[#487CFF]"
              : "border-slate-300 hover:border-slate-400",
          disabled && "cursor-not-allowed opacity-60 bg-slate-50",
        )}
      >
        <span
          className={cn(
            "flex-1 text-left truncate",
            value ? "text-slate-900" : "text-slate-400",
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="flex items-center justify-center rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {searchable && (
              <div className="relative border-b border-slate-100">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  autoFocus
                  className="h-11 w-full bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filtered.length === 1) {
                      handleSelect(filtered[0].value)
                    }
                    if (e.key === "Escape") setOpen(false)
                  }}
                />
              </div>
            )}

            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">
                  {emptyMessage}
                </p>
              ) : (
                filtered.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-[#487CFF]/8 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-[#487CFF]" />
                        )}
                      </span>
                      <span>{option.label}</span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
