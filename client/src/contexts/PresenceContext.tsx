/**
 * Contexto de presencia en tiempo real
 *
 * Expone el estado de conexión de todos los usuarios (en línea, ocupado, ausente).
 * Los componentes pueden consultar el estado de un usuario específico
 * y recibir actualizaciones en tiempo real mediante la función getUser().
 *
 * Se conecta al canal de presencia cuando hay un usuario autenticado
 * y se desconecta al cerrar sesión o desmontar el proveedor.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { presenceService, type UserStatusType } from "../services/presence"
import { useAuth } from "./AuthContext"

export interface UserPresence {
  status: UserStatusType | "offline"
  online_at: string | null
}

interface PresenceContextValue {
  /** Devuelve el estado de un usuario (en línea, ocupado u offline) */
  getUser: (userId: string) => UserPresence
  /** Verifica rápidamente si un usuario está conectado */
  isOnline: (userId: string) => boolean
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth()
  const user = state.user
  // Fuerza re-render cuando cambia la presencia
  const [, forceUpdate] = useState(0)
  const presenceRef = useRef(presenceService)

  useEffect(() => {
    if (!user?.id) {
      presenceRef.current.disconnect()
      return
    }

    // Conecta al canal de presencia al autenticarse
    presenceRef.current.connect(user.id)

    // Escucha cambios para forzar re-renderizado
    const unsub = presenceRef.current.subscribe(() => {
      forceUpdate((n) => n + 1)
    })

    // Limpia al desmontar o cambiar de usuario
    return () => {
      unsub()
      presenceRef.current.disconnect()
    }
  }, [user?.id])

  const value: PresenceContextValue = {
    getUser: (userId: string) => presenceRef.current.getUserStatus(userId),
    isOnline: (userId: string) => presenceRef.current.isOnline(userId),
  }

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  )
}

/**
 * Hook para acceder al estado de presencia desde cualquier componente
 *
 * Uso:
 *   const { getUser, isOnline } = usePresence()
 *   const estado = getUser("uid-123") // { status: "online", online_at: "..." }
 */
export function usePresence() {
  const ctx = useContext(PresenceContext)
  if (!ctx) throw new Error("usePresence debe usarse dentro de PresenceProvider")
  return ctx
}
