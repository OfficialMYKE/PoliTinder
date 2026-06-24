/*
 * Servicio de presencia en tiempo real usando Supabase Realtime Presence
 *
 * Cada usuario autenticado se suscribe a un canal global de presencia.
 * Otros usuarios pueden consultar quién está en línea y su estado
 * (disponible, en llamada, etc.).
 */

import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type UserStatusType = "available" | "in_call";

export interface PresenceState {
  user_id: string;
  status: UserStatusType;
  online_at: string;
}

type PresenceListener = (presence: Map<string, PresenceState>) => void;

class PresenceService {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private onlineUsers = new Map<string, PresenceState>();
  private listeners = new Set<PresenceListener>();
  private status: UserStatusType = "available";

  /* Inicia la conexión de presencia para un usuario */
  async connect(userId: string) {
    this.disconnect();
    this.userId = userId;
    this.onlineUsers.clear();

    this.channel = supabase.channel("presence-global", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    this.channel
      .on("presence", { event: "sync" }, () => {
        this.handleSync();
      })
      .on("presence", { event: "join" }, ({ key }) => {
        this.handleJoin(key);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        this.handleLeave(key);
      });

    this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await this.channel!.track({
          user_id: userId,
          status: this.status,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Actualiza last_seen_at al cerrar/ocultar la página
    this.setupBeforeUnload();
  }

  /** Desconecta el canal de presencia */
  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.onlineUsers.clear();
    this.listeners.clear();
  }

  /** Cambia el estado del usuario actual */
  async setStatus(newStatus: UserStatusType) {
    this.status = newStatus;
    if (this.channel && this.userId) {
      await this.channel.track({
        user_id: this.userId,
        status: newStatus,
        online_at:
          this.onlineUsers.get(this.userId)?.online_at ??
          new Date().toISOString(),
      });
    }
  }

  /** Obtiene el estado de un usuario */
  getUserStatus(userId: string): {
    status: UserStatusType | "offline";
    online_at: string | null;
  } {
    const user = this.onlineUsers.get(userId);
    if (user) {
      return { status: user.status, online_at: user.online_at };
    }
    return { status: "offline", online_at: null };
  }

  /* Verifica si un usuario está en línea */
  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /* Se suscribe a cambios de presencia */
  subscribe(listener: PresenceListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /* Devuelve el mapa actual de usuarios en línea */
  getOnlineUsers(): Map<string, PresenceState> {
    return new Map(this.onlineUsers);
  }

  private handleSync() {
    if (!this.channel) return;
    const state = this.channel.presenceState();
    this.onlineUsers.clear();
    for (const [key, presences] of Object.entries(state)) {
      const p = Array.isArray(presences)
        ? presences[presences.length - 1]
        : presences;
      const presence = p as unknown as PresenceState;
      if (presence?.user_id) {
        this.onlineUsers.set(presence.user_id, presence);
      }
    }
    this.notify();
  }

  private handleJoin(key: string) {
    this.updateLastSeen(key);
  }

  private handleLeave(key: string) {
    // Alguien se fue: actualiza su last_seen_at en la BD
    this.updateLastSeenInDB(key);
    this.onlineUsers.delete(key);
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(new Map(this.onlineUsers));
    }
  }

  private setupBeforeUnload() {
    const update = () => {
      if (this.userId) {
        this.updateLastSeenInDB(this.userId);
      }
    };
    window.addEventListener("beforeunload", update);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && this.userId) {
        this.updateLastSeenInDB(this.userId);
      }
    });
  }

  private async updateLastSeenInDB(userId: string) {
    try {
      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", userId);
    } catch {
      // Silencia errores de red
    }
  }

  private updateLastSeen(userId: string) {
    void userId;
  }
}

export const presenceService = new PresenceService();
