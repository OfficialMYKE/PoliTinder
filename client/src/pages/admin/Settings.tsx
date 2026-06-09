import { useEffect, useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getSystemSettings, updateSystemSetting } from "../../services/admin"
import type { SystemSetting } from "../../services/admin"

export default function AdminSettings() {
  const { state } = useAuth()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    getSystemSettings()
      .then((data) => {
        setSettings(data)
        const initial: Record<string, string> = {}
        for (const s of data) initial[s.key] = s.value
        setEdited(initial)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!state.user?.id) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const promises = Object.entries(edited).map(([key, value]) =>
        updateSystemSetting(key, value, state.user!.id),
      )
      await Promise.all(promises)
      setSaveMessage("Cambios guardados correctamente")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const getSetting = (key: string) =>
    settings.find((s) => s.key === key)

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-zinc-100">Configuración General</h1>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-zinc-100">Parámetros del Sistema</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Nombre de la plataforma
              </label>
              <input
                type="text"
                value={edited.platform_name ?? ""}
                onChange={(e) =>
                  setEdited((prev) => ({ ...prev, platform_name: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {getSetting("platform_name") && (
                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">{getSetting("platform_name")?.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Correo de soporte
              </label>
              <input
                type="email"
                value={edited.support_email ?? ""}
                onChange={(e) =>
                  setEdited((prev) => ({ ...prev, support_email: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {getSetting("support_email") && (
                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">{getSetting("support_email")?.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Longitud máxima de publicaciones
              </label>
              <input
                type="number"
                value={edited.max_post_length ?? "500"}
                onChange={(e) =>
                  setEdited((prev) => ({ ...prev, max_post_length: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenance"
                checked={edited.maintenance_mode === "true"}
                onChange={(e) =>
                  setEdited((prev) => ({
                    ...prev,
                    maintenance_mode: e.target.checked ? "true" : "false",
                  }))
                }
                className="rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
              <label htmlFor="maintenance" className="text-sm text-slate-700 dark:text-zinc-300">
                Modo mantenimiento
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </button>
            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.includes("Error") ? "text-red-500" : "text-green-600"
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-zinc-100">Configuraciones del Sistema</h2>
          <div className="space-y-2">
            {settings.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded bg-slate-50 dark:bg-zinc-800 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{s.key}</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{s.description}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
