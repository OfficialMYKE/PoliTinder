import { useState } from "react"
import { X, Loader2, Calendar, MapPin, FileText } from "lucide-react"
import { createEvent } from "../../services/events"
import type { EventData } from "../../services/events"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit() {
    if (!title.trim() || !date || !location.trim() || submitting) return
    setSubmitting(true)
    try {
      const result = await createEvent({
        title: title.trim(),
        date,
        location: location.trim(),
        description: description.trim() || null,
      })
      if (result) {
        onEventCreated()
        handleClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setTitle("")
    setDate("")
    setLocation("")
    setDescription("")
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            Nuevo Evento
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 dark:text-zinc-500 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del evento"
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lugar del evento"
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-200 dark:border-zinc-700 px-5 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!title.trim() || !date || !location.trim() || submitting}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-full bg-[#487CFF] px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear evento
          </button>
        </div>
      </div>
    </div>
  )
}
