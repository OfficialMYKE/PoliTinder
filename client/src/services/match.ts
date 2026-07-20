import { supabase } from "./supabase"
import type { Match, UserReaction } from "../types/match"

const BASIC_DAILY_LIMIT = 10

export async function giveLike(
  userId: string,
  targetUserId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("user_reactions")
    .insert({
      user_id: userId,
      target_user_id: targetUserId,
      reaction: "like",
    })

  if (error) {
    console.error("Error guardando Like:", error)
    return false
  }

  return true
}

export async function giveDislike(
  userId: string,
  targetUserId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("user_reactions")
    .insert({
      user_id: userId,
      target_user_id: targetUserId,
      reaction: "dislike",
    })

  if (error) {
    console.error("Error guardando Dislike:", error)
    return false
  }

  return true
}

export async function checkMatch(
  userId: string,
  targetUserId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_reactions")
    .select("*")
    .eq("user_id", targetUserId)
    .eq("target_user_id", userId)
    .eq("reaction", "like")
    .maybeSingle()

  if (error) {
    console.error("Error verificando Match:", error)
    return false
  }

  return data !== null
}

export async function createMatch(
  userId: string,
  targetUserId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("matches")
    .insert({
      user1_id: userId,
      user2_id: targetUserId,
    })

  if (error) {
    console.error("Error creando Match:", error)
    return false
  }

  return true
}

export async function getDailySwipeCount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data, error } = await supabase
    .from("user_reactions")
    .select("id, created_at")
    .eq("user_id", userId)
    .gte("created_at", todayISO)

  if (error) {
    console.error("Error counting daily swipes:", error)
    return 0
  }

  // Filter client-side to ensure we only count today's swipes
  const todayStr = new Date().toISOString().split("T")[0]
  const todayReactions = (data ?? []).filter((r: { created_at: string }) => {
    return r.created_at.startsWith(todayStr)
  })

  return todayReactions.length
}

export async function registerDailySwipe(_userId: string): Promise<number> {
  return await getDailySwipeCount(_userId)
}

export function hasReachedDailyLimit(
  swipesUsed: number,
  isPremium: boolean,
): boolean {
  if (isPremium) return false
  return swipesUsed >= BASIC_DAILY_LIMIT
}

export function getRemainingSwipes(
  swipesUsed: number,
  isPremium: boolean,
): number | null {
  if (isPremium) return null
  return Math.max(0, BASIC_DAILY_LIMIT - swipesUsed)
}

export async function getMatches(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching matches:", error)
    return []
  }

  return (data as Match[]) ?? []
}

export async function getMatchedUserIds(userId: string): Promise<string[]> {
  const matches = await getMatches(userId)
  return matches.map((m) =>
    m.user1_id === userId ? m.user2_id : m.user1_id,
  )
}

export async function getReactedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_reactions")
    .select("target_user_id")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching reacted users:", error)
    return []
  }

  return (data ?? []).map((r: { target_user_id: string }) => r.target_user_id)
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", userId)

  if (error) {
    console.error("Error fetching blocked users:", error)
    return []
  }

  const blockedByOthers = await supabase
    .from("blocked_users")
    .select("blocker_id")
    .eq("blocked_id", userId)

  const blockedIds = (data ?? []).map((r: { blocked_id: string }) => r.blocked_id)
  const blockedBy = (blockedByOthers.data ?? []).map((r: { blocker_id: string }) => r.blocker_id)

  return [...new Set([...blockedIds, ...blockedBy])]
}

export async function getSentRequests(userId: string): Promise<SentRequest[]> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status, created_at")
    .eq("sender_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error || !data) return []

  // Fetch receiver profiles
  const receiverIds = data.map((r: any) => r.receiver_id)
  if (receiverIds.length === 0) return []

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, career")
    .in("id", receiverIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return data.map((req: any) => {
    const profile = profileMap.get(req.receiver_id)
    return {
      ...req,
      receiver_nickname: profile?.nickname ?? null,
      receiver_avatar: profile?.avatar_url ?? null,
      receiver_career: profile?.career ?? null,
    }
  })
}

export interface SentRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "blocked"
  created_at: string
  receiver_nickname?: string
  receiver_avatar?: string | null
  receiver_career?: string
}
