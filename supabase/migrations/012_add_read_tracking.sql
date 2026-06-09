-- ============================================================
-- Migration 012: Read tracking for conversations
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Add last_read_at columns to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS participant1_last_read_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS participant2_last_read_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Recreate view to include read timestamps
DROP VIEW IF EXISTS conversations_with_last_message;
CREATE VIEW conversations_with_last_message AS
SELECT
  c.id,
  c.participant1_id,
  c.participant2_id,
  c.last_message_at,
  c.created_at,
  c.participant1_last_read_at,
  c.participant2_last_read_at,
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

-- 3. Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';
