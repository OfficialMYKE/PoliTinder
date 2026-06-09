import { supabase } from "./supabase"
import type { Conversation, ConversationWithLastMessage, MessageWithProfile } from "../types/message"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

// ── Conversation management ──

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<string | null> {
  const [p1, p2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId]

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant1_id", p1)
    .eq("participant2_id", p2)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from("conversations")
    .insert({ participant1_id: p1, participant2_id: p2 })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating conversation:", error)
    return null
  }
  return data.id
}

// ── Messages ──

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyToStoryId?: string,
): Promise<MessageWithProfile | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      reply_to_story_id: replyToStoryId ?? null,
    })
    .select("*, sender:profiles!sender_id(nickname, avatar_url)")
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return null
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)

  return mapMessage(data as Record<string, unknown>)
}

export async function getConversations(userId: string): Promise<ConversationWithLastMessage[]> {
  const { data, error } = await supabase
    .from("conversations_with_last_message")
    .select("*")
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
    return []
  }
  return (data ?? []) as ConversationWithLastMessage[]
}

export async function getMessages(conversationId: string): Promise<MessageWithProfile[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(nickname, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return ((data ?? []) as unknown[]).map((m) => mapMessage(m as Record<string, unknown>))
}

function mapMessage(m: Record<string, unknown>): MessageWithProfile {
  const sender = m.sender as { nickname: string; avatar_url: string | null } | undefined
  return {
    id: m.id as string,
    conversation_id: m.conversation_id as string,
    sender_id: m.sender_id as string,
    content: m.content as string,
    reply_to_story_id: (m.reply_to_story_id as string) ?? null,
    created_at: m.created_at as string,
    sender_nickname: sender?.nickname ?? "Usuario",
    sender_avatar: sender?.avatar_url ?? null,
  }
}

// ── Realtime subscriptions ──

type MessageCallback = (message: MessageWithProfile) => void
type Unsubscribe = () => void

export function subscribeToMessages(
  conversationId: string,
  onMessage: MessageCallback,
): Unsubscribe {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const newMsg = payload.new as Record<string, unknown>
        onMessage(mapMessage(newMsg))
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

type ConversationCallback = (conversation: ConversationWithLastMessage) => void

export function subscribeToConversations(
  userId: string,
  onUpdate: ConversationCallback,
): Unsubscribe {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
        filter: `participant1_id=eq.${userId}`,
      },
      async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const updated = payload.new as Record<string, unknown>
        const conv = await getConversationById(updated.id as string)
        if (conv) onUpdate(conv)
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
        filter: `participant2_id=eq.${userId}`,
      },
      async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const updated = payload.new as Record<string, unknown>
        const conv = await getConversationById(updated.id as string)
        if (conv) onUpdate(conv)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

async function getConversationById(id: string): Promise<ConversationWithLastMessage | null> {
  const { data } = await supabase
    .from("conversations_with_last_message")
    .select("*")
    .eq("id", id)
    .single()

  return data as ConversationWithLastMessage | null
}

// ── Helpers ──

export function getOtherParticipant(conv: ConversationWithLastMessage, currentUserId: string) {
  const isP1 = conv.participant1_id === currentUserId
  return {
    id: isP1 ? conv.participant2_id : conv.participant1_id,
    nickname: isP1 ? conv.participant2_nickname : conv.participant1_nickname,
    avatar_url: isP1 ? conv.participant2_avatar : conv.participant1_avatar,
  }
}
