import { supabase } from "./supabase"

export interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "blocked"
  created_at: string
  sender_nickname?: string
  sender_avatar?: string | null
}

export async function getIncomingRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status, created_at")
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const senderIds = data.map((r: any) => r.sender_id)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .in("id", senderIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return data.map((req: any) => {
    const profile = profileMap.get(req.sender_id)
    return {
      ...req,
      sender_nickname: profile?.nickname ?? null,
      sender_avatar: profile?.avatar_url ?? null,
    }
  })
}

export async function getFriendshipStatus(
  userId: string,
  otherUserId: string,
): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("sender_id, status")
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .neq("status", "blocked")
    .limit(1)
    .maybeSingle()

  if (error || !data) return "none"
  if (data.status === "accepted") return "accepted"
  if (data.sender_id === userId) return "pending_sent"
  return "pending_received"
}

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
  const existing = await getFriendshipStatus(senderId, receiverId)
  if (existing !== "none") return false

  const { error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
    })

  return !error
}

export async function acceptFriendRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending")

  return !error
}

export async function rejectFriendRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "blocked", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending")

  return !error
}

export async function getArchivedConversationIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("archived_conversations")
    .select("conversation_id")
    .eq("user_id", userId)
  return (data ?? []).map((r: any) => r.conversation_id)
}

export async function archiveConversation(conversationId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from("archived_conversations").insert({
    conversation_id: conversationId,
    user_id: userId,
  })
  return !error
}

export async function unarchiveConversation(conversationId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("archived_conversations")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
  return !error
}

export async function getFriendRequestCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("friend_requests")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("status", "pending")

  if (error) return 0
  return count ?? 0
}

export async function getFriendsList(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status, created_at")
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const friendIds = data.map((r: any) =>
    r.sender_id === userId ? r.receiver_id : r.sender_id
  )
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .in("id", friendIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return data.map((req: any) => {
    const friendId = req.sender_id === userId ? req.receiver_id : req.sender_id
    const profile = profileMap.get(friendId)
    return {
      ...req,
      sender_nickname: profile?.nickname ?? null,
      sender_avatar: profile?.avatar_url ?? null,
    }
  })
}

export async function getMutualFriends(userId: string, otherUserId: string): Promise<FriendRequest[]> {
  const [myFriends, theirFriends] = await Promise.all([
    getFriendsList(userId),
    getFriendsList(otherUserId),
  ])
  const myFriendIds = new Set(myFriends.map((f) =>
    f.sender_id === userId ? f.receiver_id : f.sender_id
  ))
  return theirFriends.filter((f) => {
    const fid = f.sender_id === otherUserId ? f.receiver_id : f.sender_id
    return myFriendIds.has(fid)
  })
}

// ── Read tracking ──

export async function markConversationRead(conversationId: string, userId: string, column: "participant1_last_read_at" | "participant2_last_read_at"): Promise<void> {
  await supabase
    .from("conversations")
    .update({ [column]: new Date().toISOString() })
    .eq("id", conversationId)
}

export function hasUnreadMessages(conv: any, userId: string): boolean {
  const isP1 = conv.participant1_id === userId
  const lastReadAt = isP1 ? conv.participant1_last_read_at : conv.participant2_last_read_at
  if (!conv.last_message_created_at || !conv.last_message_sender_id) return false
  if (conv.last_message_sender_id === userId) return false
  if (!lastReadAt) return true
  return new Date(conv.last_message_created_at) > new Date(lastReadAt)
}

export function getReadColumn(userId: string, conv: { participant1_id: string; participant2_id: string }): "participant1_last_read_at" | "participant2_last_read_at" {
  return conv.participant1_id === userId ? "participant1_last_read_at" : "participant2_last_read_at"
}
