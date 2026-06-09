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
  const { data, error } = await supabase.rpc("get_incoming_requests", {
    receiver_id: userId,
  })
  if (error || !data) return []
  const raw = Array.isArray(data) ? data : []
  return raw as FriendRequest[]
}

export async function getFriendshipStatus(
  userId: string,
  otherUserId: string,
): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
  const { data, error } = await supabase.rpc("get_friendship_status", {
    user_id: userId,
    other_user_id: otherUserId,
  })
  if (error || !data) return "none"
  return data as "none" | "pending_sent" | "pending_received" | "accepted"
}

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
  const existing = await getFriendshipStatus(senderId, receiverId)
  if (existing !== "none") return false
  const { data, error } = await supabase.rpc("insert_friend_request", {
    sender_id: senderId,
    receiver_id: receiverId,
  })
  return !error && data === true
}

export async function acceptFriendRequest(requestId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("accept_friend_request", {
    request_id: requestId,
  })
  return !error && data === true
}

export async function rejectFriendRequest(requestId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("reject_friend_request", {
    request_id: requestId,
  })
  return !error && data === true
}

export async function getArchivedConversationIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("archived_conversations")
    .select("conversation_id")
    .eq("user_id", userId)
  return (data ?? []).map((r) => r.conversation_id)
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
  const { data, error } = await supabase.rpc("get_friend_request_count", {
    receiver_id: userId,
  })
  if (error || data === null || data === undefined) return 0
  return data as number
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
