/**
 * Indicador de estado de un usuario (en línea, ocupado, ausente)
 *
 * Muestra un punto de color + texto descriptivo según el estado actual:
 *   🟢 "En línea"    → usuario conectado y disponible
 *   🟡 "En llamada"  → usuario en videollamada o llamada de voz
 *   ⚫ "Visto hace X" → usuario desconectado, con timestamp relativo
 *
 * Props:
 *   - showDot:   muestra el punto de color (útil como overlay en avatares)
 *   - showText:  muestra el texto descriptivo
 *   - lastSeenAt: fecha ISO de última conexión (se muestra si está offline)
 */

import { usePresence, type UserPresence } from "../../contexts/PresenceContext"

interface UserStatusProps {
  userId: string
  lastSeenAt?: string | null
  showDot?: boolean
  showText?: boolean
  className?: string
}

/**
 * Formatea una fecha ISO a texto relativo en español
 *
 * Ejemplos:
 *   "Ahora"                     → < 1 minuto
 *   "Visto hace 5 min"          → 1-59 minutos
 *   "Visto hace 3h"             → 1-23 horas
 *   "Visto hace 2 días"         → 1-6 días
 *   "Visto el 15 mar"           → ≥ 7 días
 */
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

export function UserStatus({
  userId,
  lastSeenAt,
  showDot = true,
  showText = true,
  className = "",
}: UserStatusProps) {
  const presence = usePresence()
  const userPresence = presence.getUser(userId)

  // Estado: desconectado (no está en el canal de presencia)
  if (userPresence.status === "offline") {
    return (
      <span className={`flex items-center gap-1 text-xs ${className}`}>
        {showDot && (
          <span
            className="w-2 h-2 rounded-full bg-zinc-400 inline-block shrink-0"
            title="Desconectado"
          />
        )}
        {showText && (
          <span className="text-zinc-400">
            {lastSeenAt ? formatLastSeen(lastSeenAt) : "Desconectado"}
          </span>
        )}
      </span>
    )
  }

  // Estado: en llamada
  if (userPresence.status === "in_call") {
    return (
      <span className={`flex items-center gap-1 text-xs ${className}`}>
        {showDot && (
          <span
            className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0"
            title="En llamada"
          />
        )}
        {showText && (
          <span className="text-amber-400">En llamada</span>
        )}
      </span>
    )
  }

  // Estado: en línea y disponible
  return (
    <span className={`flex items-center gap-1 text-xs ${className}`}>
      {showDot && (
        <span
          className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0"
          title="En línea"
        />
      )}
      {showText && (
        <span className="text-green-500">En línea</span>
      )}
    </span>
  )
}
