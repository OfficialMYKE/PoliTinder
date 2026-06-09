-- ============================================================
-- Migration 011: Friend requests & archived conversations
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla de solicitudes de amistad
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id, status);

-- 2. Tabla de conversaciones archivadas por usuario
CREATE TABLE IF NOT EXISTS archived_conversations (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_archived_conversations_user ON archived_conversations(user_id);

-- 3. Desactivar RLS (Firebase Auth)
ALTER TABLE friend_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE archived_conversations DISABLE ROW LEVEL SECURITY;

-- 4. Conceder permisos explícitos al rol anon
GRANT ALL ON friend_requests TO anon;
GRANT ALL ON archived_conversations TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 5. Publicar en Realtime para notificaciones instantáneas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'friend_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
  END IF;
END
$$;

-- 6. Función RPC para insertar solicitud de amistad (bypassea REST API)
CREATE OR REPLACE FUNCTION insert_friend_request(sender_id TEXT, receiver_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO friend_requests (sender_id, receiver_id, status)
  VALUES (sender_id, receiver_id, 'pending');
  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    RETURN false;
END;
$$;

-- 7. Función RPC para aceptar solicitud de amistad
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE friend_requests SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id AND status = 'pending';
  RETURN FOUND;
END;
$$;

-- 8. Función RPC para rechazar solicitud de amistad
CREATE OR REPLACE FUNCTION reject_friend_request(request_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE friend_requests SET status = 'blocked', updated_at = NOW()
  WHERE id = request_id AND status = 'pending';
  RETURN FOUND;
END;
$$;

-- 9. Función RPC para listar solicitudes entrantes (con perfil del remitente)
CREATE OR REPLACE FUNCTION get_incoming_requests(receiver_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', fr.id,
        'sender_id', fr.sender_id,
        'receiver_id', fr.receiver_id,
        'status', fr.status,
        'created_at', fr.created_at,
        'sender_nickname', p.nickname,
        'sender_avatar', p.avatar_url
      )
      ORDER BY fr.created_at DESC
    )
    FROM friend_requests fr
    LEFT JOIN profiles p ON p.id = fr.sender_id
    WHERE fr.receiver_id = get_incoming_requests.receiver_id
    AND fr.status = 'pending'
  );
END;
$$;

-- 10. Función RPC para contar solicitudes pendientes
CREATE OR REPLACE FUNCTION get_friend_request_count(receiver_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM friend_requests
  WHERE receiver_id = get_friend_request_count.receiver_id
  AND status = 'pending';
  RETURN count;
END;
$$;

-- 11. Función RPC para ver estado de amistad
CREATE OR REPLACE FUNCTION get_friendship_status(user_id TEXT, other_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result RECORD;
BEGIN
  SELECT * INTO result FROM friend_requests
  WHERE (
    (sender_id = user_id AND receiver_id = other_user_id)
    OR (sender_id = other_user_id AND receiver_id = user_id)
  )
  AND status != 'blocked'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN 'none';
  END IF;

  IF result.status = 'accepted' THEN
    RETURN 'accepted';
  END IF;

  IF result.sender_id = user_id THEN
    RETURN 'pending_sent';
  END IF;

  RETURN 'pending_received';
END;
$$;

-- 12. Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';
