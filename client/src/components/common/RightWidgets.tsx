import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Calendar, MapPin, Loader2, Trash2, UserPlus } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getSuggestedUsers, getProfile } from "../../services/profile"
import { getUpcomingEvents } from "../../services/events"
import { sendFriendRequest } from "../../services/friends"
import { CreateEventModal } from "./CreateEventModal"
import { deleteEvent } from "../../services/events"
import type { ProfileData } from "../../types/profile"
import type { EventData } from "../../services/events"

function getInitials(first?: string, last?: string): string {
  return (
    `${(first?.charAt(0) ?? "").toUpperCase()}${(last?.charAt(0) ?? "").toUpperCase()}` ||
    "?"
  )
}

export function RightWidgets() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const currentUserId = state.user?.id
  const user = state.user

  const [suggestions, setSuggestions] = useState<ProfileData[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUserId) return
    getProfile(currentUserId).then((p) => {
      if (p?.avatar_url) setAvatarUrl(p.avatar_url)
    })
    getSuggestedUsers(currentUserId, 6)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false))
  }, [currentUserId])

  useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .finally(() => setLoadingEvents(false))
  }, [])

  async function handleFollow(userId: string) {
    if (!currentUserId) return
    const ok = await sendFriendRequest(currentUserId, userId)
    if (ok) {
      setSentRequests((prev) => new Set(prev).add(userId))
    }
  }

  const firstName = user?.firstName ?? ""
  const lastName = user?.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = getInitials(firstName, lastName)

  return (
    <div className="space-y-5">
      {/* User profile card */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#487CFF]/10"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#487CFF]">
              {initials}
            </div>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="text-sm font-semibold text-slate-900 dark:text-zinc-100 hover:underline text-left"
          >
            {user?.email?.split("@")[0] ?? "usuario"}
          </button>
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
            {fullName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/premium")}
          className="text-xs font-semibold text-[#487CFF] hover:text-[#3a6ae0]"
        >
          Cambiar
        </button>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
            Sugerencias para ti
          </h3>
          <button
            type="button"
            onClick={() => navigate("/matches")}
            className="text-xs font-semibold text-slate-900 dark:text-zinc-100 hover:underline"
          >
            Ver todos
          </button>
        </div>

        {loadingSuggestions ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-zinc-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            No hay sugerencias disponibles.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => {
              const sInitials = getInitials(s.nickname, s.career)
              const isSent = sentRequests.has(s.id)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${s.id}`)}
                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#487CFF]/10"
                  >
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#487CFF]">
                        {sInitials}
                      </div>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${s.id}`)}
                      className="text-sm font-semibold text-slate-900 dark:text-zinc-100 hover:underline text-left block truncate"
                    >
                      {s.nickname}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {s.career || s.faculty || "Sugerencia para ti"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFollow(s.id)}
                    disabled={isSent}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#487CFF] transition-colors hover:bg-[#487CFF]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSent ? (
                      "Enviado"
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3" />
                        Seguir
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Eventos */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Eventos
          </h3>
          <button
            type="button"
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-1 rounded-full bg-[#487CFF]/10 px-3 py-1 text-xs font-medium text-[#487CFF] transition-colors hover:bg-[#487CFF] hover:text-white"
          >
            <Plus className="h-3 w-3" />
            Nuevo
          </button>
        </div>
        {loadingEvents ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-zinc-500" />
          </div>
        ) : events.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-slate-400 dark:text-zinc-500">
            No hay eventos próximos.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {events.map((event) => (
              <div
                key={event.id}
                className="group flex items-start justify-between px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {event.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await deleteEvent(event.id)
                    if (ok) {
                      setEvents((prev) => prev.filter((e) => e.id !== event.id))
                    }
                  }}
                  className="ml-2 mt-1 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-[11px] text-slate-400 dark:text-zinc-500 space-y-1">
        <div className="flex flex-wrap gap-x-1.5">
          <span className="hover:underline cursor-pointer">Información</span>
          <span>·</span>
          <span className="hover:underline cursor-pointer">Ayuda</span>
          <span>·</span>
          <span className="hover:underline cursor-pointer">API</span>
          <span>·</span>
          <span className="hover:underline cursor-pointer">Privacidad</span>
          <span>·</span>
          <span className="hover:underline cursor-pointer">Condiciones</span>
        </div>
        <p>© 2026 POLiTINDER</p>
      </div>

      <CreateEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventCreated={() => {
          setShowEventModal(false)
          getUpcomingEvents().then(setEvents)
        }}
      />
    </div>
  )
}
