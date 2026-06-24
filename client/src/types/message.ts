export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
}

export interface ConversationWithLastMessage extends Conversation {
  participant1_nickname: string | null
  participant1_avatar: string | null
  participant2_nickname: string | null
  participant2_avatar: string | null
  participant1_last_read_at: string | null
  participant2_last_read_at: string | null
  participant1_last_seen_at: string | null
  participant2_last_seen_at: string | null
  last_message_id: string | null
  last_message_content: string | null
  last_message_sender_id: string | null
  last_message_sender_nickname: string | null
  last_message_created_at: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  reply_to_story_id: string | null
  created_at: string
}

export interface MessageWithProfile extends Message {
  sender_nickname: string
  sender_avatar: string | null
}
