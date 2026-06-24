/**
 * Contexto de presencia en tiempo real
 *
 * Expone el estado de conexión de todos los usuarios (en línea, ocupado, ausente).
 * Los componentes pueden consultar el estado de un usuario específico
 * y recibir actualizaciones en tiempo real.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { presenceService, type UserStatusType } from "../services/presence"
import { useAuth } from "./AuthContext"

export interface UserPresence {
  status: UserStatusType | "offline"
  online_at: string | null
}

interface PresenceContextValue {
  getUser: (userId: string) => UserPresence
  isOnline: (userId: string) => boolean
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth()
  const user = state.user
  const [, forceUpdate] = useState(0)
  const presenceRef = useRef(presenceService)

  useEffect(() => {
    if (!user?.id) {
      presenceRef.current.disconnect()
      return
    }

    presenceRef.current.connect(user.id)

    const unsub = presenceRef.current.subscribe(() => {
      forceUpdate((n) => n + 1)
    })

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

export function usePresence() {
  const ctx = useContext(PresenceContext)
  if (!ctx) throw new Error("usePresence debe usarse dentro de PresenceProvider")
  return ctx
}
