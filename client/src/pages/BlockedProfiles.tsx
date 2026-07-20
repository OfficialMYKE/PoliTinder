import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ShieldOff, User, Eye } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getBlockedUsers, unblockUser, type BlockedUser } from "../services/blocked"

export default function BlockedProfiles() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!authState.user?.id) return
      try {
        const data = await getBlockedUsers(authState.user.id)
        setBlocked(data)
      } catch {
        console.error("Error al cargar perfiles bloqueados")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authState.user?.id])

  async function handleUnblock(blockedId: string) {
    if (!authState.user?.id) return
    if (!confirm("¿Desbloquear este usuario? Aparecerá nuevamente en tus sugerencias.")) return

    setUnblockingId(blockedId)
    try {
      const ok = await unblockUser(authState.user.id, blockedId)
      if (ok) {
        setBlocked((prev) => prev.filter((b) => b.blocked_id !== blockedId))
      }
    } finally {
      setUnblockingId(null)
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
            Perfiles bloqueados
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {blocked.length} usuario{blocked.length !== 1 ? "s" : ""} bloqueado{blocked.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {blocked.length === 0 ? (
            <div className="text-center py-16">
              <ShieldOff className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                No hay perfiles bloqueados
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Cuando bloquees usuarios, no volverán a aparecer en tus sugerencias ni podrán contactarte.
              </p>
            </div>
          ) : (
            blocked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:shadow-sm"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  {item.blocked_avatar ? (
                    <img
                      src={item.blocked_avatar}
                      alt={item.blocked_nickname}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-lg font-bold text-[#487CFF]">
                        {item.blocked_nickname?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {item.blocked_nickname ?? "Usuario"}
                  </p>
                  {item.blocked_career && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {item.blocked_career}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                    Bloqueado el {new Date(item.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${item.blocked_id}`)}
                    className="h-8 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs font-medium text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700 hover:text-[#487CFF]"
                    title="Ver perfil"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnblock(item.blocked_id)}
                    disabled={unblockingId === item.blocked_id}
                    className="h-8 rounded-full bg-[#487CFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#3a6ae0] disabled:opacity-50"
                  >
                    {unblockingId === item.blocked_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Desbloquear"
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
