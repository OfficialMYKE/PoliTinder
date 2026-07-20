import { supabase } from "./supabase"

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
  blocked_nickname?: string
  blocked_avatar?: string | null
  blocked_career?: string
}

export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("block_user", {
    p_blocker_id: blockerId,
    p_blocked_id: blockedId,
  })
  if (error) {
    console.error("Error blocking user:", error)
    return false
  }
  return data === true
}

export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("unblock_user", {
    p_blocker_id: blockerId,
    p_blocked_id: blockedId,
  })
  if (error) {
    console.error("Error unblocking user:", error)
    return false
  }
  return data === true
}

export async function isUserBlocked(
  userId: string,
  otherUserId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_user_blocked", {
    p_user_id: userId,
    p_other_id: otherUserId,
  })
  if (error || data === null || data === undefined) return false
  return data === true
}

export async function getBlockedUsers(
  userId: string,
): Promise<BlockedUser[]> {
  const { data, error } = await supabase.rpc("get_blocked_users", {
    p_user_id: userId,
  })
  if (error || !data) return []
  const raw = Array.isArray(data) ? data : []
  return raw as BlockedUser[]
}
