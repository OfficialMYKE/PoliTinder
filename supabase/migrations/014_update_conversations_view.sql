-- Migración 014: Actualiza conversations_with_last_message con last_seen_at
-- Agrega los campos participant1_last_seen_at y participant2_last_seen_at
-- a la vista de conversaciones para mostrar en el frontend cuándo fue la
-- última conexión de cada participante.

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
  p1.last_seen_at AS participant1_last_seen_at,
  p2.nickname AS participant2_nickname,
  p2.avatar_url AS participant2_avatar,
  p2.last_seen_at AS participant2_last_seen_at,
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

NOTIFY pgrst, 'reload schema';
