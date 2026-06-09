-- ============================================================
-- Migration 010: Messaging (conversations + messages)
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla de conversaciones (pares de usuarios)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id),
  CONSTRAINT different_participants CHECK (participant1_id <> participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- 2. Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  reply_to_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 3. Vista: conversaciones con perfiles de ambos participantes y último mensaje
CREATE OR REPLACE VIEW conversations_with_last_message AS
SELECT
  c.id,
  c.participant1_id,
  c.participant2_id,
  c.last_message_at,
  c.created_at,
  p1.nickname AS participant1_nickname,
  p1.avatar_url AS participant1_avatar,
  p2.nickname AS participant2_nickname,
  p2.avatar_url AS participant2_avatar,
  lm.id AS last_message_id,
  lm.content AS last_message_content,
  lm.sender_id AS last_message_sender_id,
  lm.created_at AS last_message_created_at,
  CASE WHEN c.participant1_id = lm.sender_id THEN p1.nickname ELSE p2.nickname END AS last_message_sender_nickname
FROM conversations c
LEFT JOIN LATERAL (
  SELECT m.id, m.content, m.sender_id, m.created_at
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON TRUE
LEFT JOIN profiles p1 ON p1.id = c.participant1_id
LEFT JOIN profiles p2 ON p2.id = c.participant2_id;

-- 4. Desactivar RLS (Firebase Auth)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 5. Habilitar Realtime para mensajería instantánea
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
