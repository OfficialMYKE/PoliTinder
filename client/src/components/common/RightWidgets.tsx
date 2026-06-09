import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Calendar, MapPin, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getSuggestedUsers } from "../../services/profile"
import { getUpcomingEvents } from "../../services/events"
import { CreateEventModal } from "./CreateEventModal"
import { deleteEvent } from "../../services/events"
import type { ProfileData } from "../../types/profile"
import type { EventData } from "../../services/events"

export function RightWidgets() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const currentUserId = state.user?.id

  const [suggestions, setSuggestions] = useState<ProfileData[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)

  useEffect(() => {
    if (!currentUserId) return
    getSuggestedUsers(currentUserId, 3)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false))
  }, [currentUserId])

  useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .finally(() => setLoadingEvents(false))
  }, [])

  return (
    <div className="space-y-4">
      {/* Sugerencias para ti */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Sugerencias para ti
          </h3>
        </div>
        {loadingSuggestions ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-zinc-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-slate-400 dark:text-zinc-500">
            No hay sugerencias disponibles.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {suggestions.map((user) => {
              const initials = `${user.nickname?.charAt(0)?.toUpperCase() ?? "?"}`
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#487CFF]/10 text-sm font-semibold text-[#487CFF] select-none cursor-pointer"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nickname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate text-left hover:underline cursor-pointer"
                    >
                      {user.nickname}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {user.career || user.faculty || "Estudiante"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full border border-[#487CFF] px-3 py-1 text-xs font-medium text-[#487CFF] transition-colors hover:bg-[#487CFF] hover:text-white"
                  >
                    <Plus className="h-3 w-3" />
                    Conectar
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Avisos y Eventos */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Avisos y Eventos
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
