/**
 * Indicador de estado de un usuario (en línea, ocupado, ausente)
 *
 * Muestra un punto de color + texto descriptivo.
 * Si está offline y se proporciona last_seen_at, muestra "Visto hace X tiempo".
 */

import { usePresence, type UserPresence } from "../../contexts/PresenceContext"

interface UserStatusProps {
  userId: string
  lastSeenAt?: string | null
  showDot?: boolean
  showText?: boolean
  className?: string
}

function formatLastSeen(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return "Ahora"
  if (diffMin < 60) return `Visto hace ${diffMin} min`
  if (diffHour < 24) return `Visto hace ${diffHour}h`
  if (diffDay < 7) return `Visto hace ${diffDay} día${diffDay > 1 ? "s" : ""}`
  return `Visto el ${new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
}

export function UserStatus({ userId, lastSeenAt, showDot = true, showText = true, className = "" }: UserStatusProps) {
  const presence = usePresence()
  const userPresence = presence.getUser(userId)

  if (userPresence.status === "offline") {
    return (
      <span className={`flex items-center gap-1 text-xs ${className}`}>
        {showDot && (
          <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block shrink-0" title="Desconectado" />
        )}
        {showText && (
          <span className="text-zinc-400">
            {lastSeenAt ? formatLastSeen(lastSeenAt) : "Desconectado"}
          </span>
        )}
      </span>
    )
  }

  if (userPresence.status === "in_call") {
    return (
      <span className={`flex items-center gap-1 text-xs ${className}`}>
        {showDot && (
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" title="En llamada" />
        )}
        {showText && (
          <span className="text-amber-400">En llamada</span>
        )}
      </span>
    )
  }

  // available / online
  return (
    <span className={`flex items-center gap-1 text-xs ${className}`}>
      {showDot && (
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" title="En línea" />
      )}
      {showText && (
        <span className="text-green-500">En línea</span>
      )}
    </span>
  )
}
