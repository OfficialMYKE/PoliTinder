import { supabase } from "./supabase"
import type { Match, UserReaction } from "../types/match"

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