/**
 * Servicio de presencia en tiempo real usando Supabase Realtime Presence
 *
 * Cada usuario autenticado se suscribe a un canal global de presencia
 * ("presence-global"). El canal detecta automáticamente cuándo un usuario
 * se conecta (join) o desconecta (leave), y sincroniza el estado de todos.
 *
 * Estados disponibles:
 * - "available": usuario activo en la web, disponible para llamadas
 * - "in_call": usuario en una videollamada o llamada de voz
 * - "offline": no está conectado (determinado por ausencia en el canal)
 *
 * Además, actualiza last_seen_at en la BD cuando el usuario cierra/oculta la página.
 */

import { supabase } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

/** Estado que un usuario puede tener mientras está en línea */
export type UserStatusType = "available" | "in_call"

/** Datos que cada usuario publica en el canal de presencia */
export interface PresenceState {
  user_id: string
  status: UserStatusType
  online_at: string
}

type PresenceListener = (presence: Map<string, PresenceState>) => void

class PresenceService {
  private channel: RealtimeChannel | null = null
  private userId: string | null = null
  /** Mapa de usuarios en línea: clave = userId, valor = PresenceState */
  private onlineUsers = new Map<string, PresenceState>()
  /** Lista de callbacks para notificar cambios de presencia */
  private listeners = new Set<PresenceListener>()
  /** Estado actual del usuario local */
  private status: UserStatusType = "available"

  /**
   * Inicia la conexión de presencia para un usuario
   *
   * Crea un canal Supabase Realtime con tracking de presencia y se suscribe.
   * Al suscribirse exitosamente, publica su estado actual en el canal.
   */
  async connect(userId: string) {
    this.disconnect()
    this.userId = userId
    this.onlineUsers.clear()

    this.channel = supabase.channel("presence-global", {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    this.channel
      .on("presence", { event: "sync" }, () => {
        this.handleSync()
      })
      .on("presence", { event: "join" }, ({ key }) => {
        this.handleJoin(key)
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        this.handleLeave(key)
      })

    this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await this.channel!.track({
          user_id: userId,
          status: this.status,
          online_at: new Date().toISOString(),
        })
      }
    })

    // Actualiza last_seen_at al cerrar/ocultar la página
    this.setupBeforeUnload()
  }

  /** Desconecta el canal de presencia y limpia todos los datos locales */
  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
    this.userId = null
    this.onlineUsers.clear()
    this.listeners.clear()
  }

  /**
   * Cambia el estado del usuario actual y lo publica en el canal
   *
   * Útil para marcar "in_call" cuando el usuario inicia/contesta una llamada
   * y volver a "available" cuando cuelga.
   */
  async setStatus(newStatus: UserStatusType) {
    this.status = newStatus
    if (this.channel && this.userId) {
      await this.channel.track({
        user_id: this.userId,
        status: newStatus,
        online_at:
          this.onlineUsers.get(this.userId)?.online_at ??
          new Date().toISOString(),
      })
    }
  }

  /** Obtiene el estado de un usuario (online + estado, u offline) */
  getUserStatus(userId: string): {
    status: UserStatusType | "offline"
    online_at: string | null
  } {
    const user = this.onlineUsers.get(userId)
    if (user) {
      return { status: user.status, online_at: user.online_at }
    }
    return { status: "offline", online_at: null }
  }

  /** Verifica si un usuario está en línea */
  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId)
  }

  /** Se suscribe a cambios de presencia (nuevos joins/leaves/syncs) */
  subscribe(listener: PresenceListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Devuelve el mapa actual de usuarios en línea */
  getOnlineUsers(): Map<string, PresenceState> {
    return new Map(this.onlineUsers)
  }

  /**
   * Sincronización completa del estado de presencia
   *
   * Se dispara periódicamente o cuando hay cambios mayores.
   * Reconstruye el mapa onlineUsers desde cero con los datos del canal.
   */
  private handleSync() {
    if (!this.channel) return
    const state = this.channel.presenceState()
    this.onlineUsers.clear()
    for (const [key, presences] of Object.entries(state)) {
      // Toma la última presencia publicada por cada usuario
      const p = Array.isArray(presences)
        ? presences[presences.length - 1]
        : presences
      const presence = p as unknown as PresenceState
      if (presence?.user_id) {
        this.onlineUsers.set(presence.user_id, presence)
      }
    }
    this.notify()
  }

  /** Un usuario se conectó: registra su entrada (reservado para futura lógica) */
  private handleJoin(key: string) {
    this.updateLastSeen(key)
  }

  /**
   * Un usuario se desconectó: actualiza su last_seen_at en la BD
   * y lo elimina del mapa local
   */
  private handleLeave(key: string) {
    this.updateLastSeenInDB(key)
    this.onlineUsers.delete(key)
    this.notify()
  }

  /** Notifica a todos los listeners sobre cambios en la presencia */
  private notify() {
    for (const listener of this.listeners) {
      listener(new Map(this.onlineUsers))
    }
  }

  /**
   * Configura eventos para actualizar last_seen_at cuando el usuario
   * cierra la pestaña o la oculta (cambia de pestaña/minimiza)
   */
  private setupBeforeUnload() {
    const update = () => {
      if (this.userId) {
        this.updateLastSeenInDB(this.userId)
      }
    }
    window.addEventListener("beforeunload", update)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && this.userId) {
        this.updateLastSeenInDB(this.userId)
      }
    })
  }

  /** Guarda la hora actual como last_seen_at del usuario en la BD */
  private async updateLastSeenInDB(userId: string) {
    try {
      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", userId)
    } catch {
      // Silencia errores de red para no interrumpir la experiencia
    }
  }

  /** Reservado: podría usarse para tracking local de última vez visto */
  private updateLastSeen(userId: string) {
    void userId
  }
}

/** Singleton del servicio de presencia */
export const presenceService = new PresenceService()
