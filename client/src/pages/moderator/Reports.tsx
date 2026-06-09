import { useEffect, useState } from "react"
import { Flag, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getReports, updateReportStatus } from "../../services/admin"
import type { Report } from "../../services/admin"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  reviewing: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  resolved: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  dismissed: "bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  resolved: "Resuelto",
  dismissed: "Rechazado",
}

export default function ModeratorReports() {
  const { state } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleResolve(reportId: string) {
    if (!state.user?.id) return
    setUpdating(reportId)
    try {
      await updateReportStatus(reportId, "resolved", state.user.id)
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "resolved" } : r,
        ),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  async function handleDismiss(reportId: string) {
    if (!state.user?.id) return
    setUpdating(reportId)
    try {
      await updateReportStatus(reportId, "dismissed", state.user.id)
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "dismissed" } : r,
        ),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const pending = reports.filter((r) => r.status === "pending")

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Revisar Reportes</h1>
        <span className="inline-flex items-center rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <Flag className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400">No hay reportes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Flag className="mt-0.5 h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    Reporte de <span className="font-semibold">{r.reporter_nickname ?? "Usuario"}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Usuario reportado: <span className="font-medium">{r.reported_nickname ?? r.reported_id.slice(0, 8)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Motivo: {r.reason}</p>
                  {r.description && (
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500 italic">{r.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString("es-EC", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
                {r.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleResolve(r.id)}
                      disabled={updating === r.id}
                      className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 disabled:opacity-50"
                      title="Resolver"
                    >
                      {updating === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismiss(r.id)}
                      disabled={updating === r.id}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                      title="Rechazar"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
