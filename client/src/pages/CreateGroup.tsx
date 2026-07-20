import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, Users } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { createGroup } from "../services/groups"
import { Button } from "../components/ui/button"
import { FACULTIES } from "../data/academicData"

export default function CreateGroup() {
  const navigate = useNavigate()
  const { state: authState } = useAuth()
  const userId = authState.user?.id

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [faculty, setFaculty] = useState("")
  const [career, setCareer] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const careers = FACULTIES.find((f) => f.value === faculty)?.careers ?? []

  async function handleCreate() {
    if (!userId || !name.trim()) return
    setSaving(true)
    setError("")

    const group = await createGroup({
      name: name.trim(),
      description: description.trim(),
      faculty,
      career,
      creator_id: userId,
    })

    if (group) {
      navigate(`/groups/${group.id}`)
    } else {
      setError("Error al crear el grupo. Intenta de nuevo.")
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/groups")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Crear Grupo</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Crea un grupo de estudio para conectar con otros estudiantes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block">
              Nombre del grupo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Grupo de Cálculo III"
              maxLength={50}
              className="h-12 w-full rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50 focus:border-[#487CFF]"
            />
            <p className="mt-1 text-right text-xs text-slate-400 dark:text-zinc-500">
              {name.length}/50
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este grupo? ¿Qué temas se discuten?"
              maxLength={280}
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3.5 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50 focus:border-[#487CFF]"
            />
            <p className="mt-1 text-right text-xs text-slate-400 dark:text-zinc-500">
              {description.length}/280
            </p>
          </div>

          {/* Faculty */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block">
              Facultad
            </label>
            <select
              value={faculty}
              onChange={(e) => {
                setFaculty(e.target.value)
                setCareer("")
              }}
              className="h-12 w-full rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50"
            >
              <option value="">Seleccionar facultad</option>
              {FACULTIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Career */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block">
              Carrera
            </label>
            <select
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              disabled={!faculty}
              className="h-12 w-full rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50"
            >
              <option value="">
                {faculty ? "Seleccionar carrera" : "Primero selecciona una facultad"}
              </option>
              {careers.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => navigate("/groups")}
              variant="outline"
              className="flex-1 h-10 rounded-full border-slate-200 dark:border-zinc-700 text-sm font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || saving}
              className="flex-1 h-10 rounded-full bg-[#487CFF] text-white text-sm font-medium hover:bg-[#3a6ae0] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Users className="h-4 w-4 mr-1.5" />
                  Crear grupo
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
