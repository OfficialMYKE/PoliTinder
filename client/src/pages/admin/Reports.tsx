import { useEffect, useState } from "react"
import { Flag, Loader2 } from "lucide-react"
import { supabase } from "../../services/supabase"

interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  status: string
  created_at: string
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn("[Reports] Tabla no disponible:", error.message)
          setTableExists(false)
        } else {
          setReports((data as Report[]) ?? [])
        }
      })
      .catch(() => setTableExists(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Reportes de Incidencias</h1>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Flag className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">
            La tabla de reportes aún no está creada en Supabase.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ejecuta la migración correspondiente para habilitar esta funcionalidad.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Reportes de Incidencias</h1>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Flag className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No hay reportes pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Flag className="mt-0.5 h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Reporte #{r.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500">Motivo: {r.reason}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  r.status === "pending"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {r.status === "pending" ? "Pendiente" : r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
