import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Clock, CheckCircle, XCircle, User } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getSentRequests, type SentRequest } from "../services/match"
import { rejectFriendRequest } from "../services/friends"

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  accepted: {
    label: "Aceptada",
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  blocked: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
  },
}

export default function SentRequests() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<SentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!authState.user?.id) return
      try {
        const data = await getSentRequests(authState.user.id)
        setRequests(data)
      } catch {
        console.error("Error al cargar solicitudes enviadas")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authState.user?.id])

  async function handleCancel(requestId: string) {
    if (!confirm("¿Cancelar esta solicitud?")) return
    const ok = await rejectFriendRequest(requestId)
    if (ok) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            Solicitudes enviadas
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {requests.length} solicitud{requests.length !== 1 ? "es" : ""} pendiente{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                No hay solicitudes enviadas
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Cuando envíes solicitudes de conexión, aparecerán aquí.
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const config = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
              const StatusIcon = config.icon

              return (
                <div
                  key={req.id}
                  className={`flex items-center gap-4 rounded-2xl border ${config.border} ${config.bg} p-4 transition-all`}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/80 dark:bg-zinc-800 shadow-sm">
                    {req.receiver_avatar ? (
                      <img
                        src={req.receiver_avatar}
                        alt={req.receiver_nickname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-lg font-bold text-[#487CFF]">
                          {req.receiver_nickname?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {req.receiver_nickname ?? "Usuario"}
                    </p>
                    {req.receiver_career && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {req.receiver_career}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <StatusIcon className={`h-3 w-3 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        · {new Date(req.created_at).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>

                  {req.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(req.id)}
                      className="shrink-0 h-8 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-xs font-medium text-slate-600 dark:text-zinc-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700 hover:text-red-500"
                    >
                      Cancelar
                    </button>
                  )}

                  {req.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${req.receiver_id}`)}
                      className="shrink-0 h-8 rounded-full bg-[#487CFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#3a6ae0]"
                    >
                      Ver perfil
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
