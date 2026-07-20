-- Migración 016: tabla blocked_users + seguimiento daily_swipes

-- 1. Tabla de usuarios bloqueados
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- 2. Tabla de swipes diarios (para enforce límite de plan)
CREATE TABLE IF NOT EXISTS daily_swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swipe_date DATE NOT NULL DEFAULT CURRENT_DATE,
  swipe_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT unique_daily_swipe UNIQUE (user_id, swipe_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_swipes_user_date ON daily_swipes(user_id, swipe_date);

-- 3. Desactivar RLS
ALTER TABLE blocked_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_swipes DISABLE ROW LEVEL SECURITY;

-- 4. Conceder permisos
GRANT ALL ON blocked_users TO anon;
GRANT ALL ON daily_swipes TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 5. Realtime para blocked_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'blocked_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blocked_users;
  END IF;
END
$$;

-- 6. RPC: Registrar un swipe diario
CREATE OR REPLACE FUNCTION register_daily_swipe(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO daily_swipes (user_id, swipe_date, swipe_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, swipe_date)
  DO UPDATE SET swipe_count = daily_swipes.swipe_count + 1
  RETURNING swipe_count INTO current_count;

  RETURN current_count;
END;
$$;

-- 7. RPC: Obtener swipe count de hoy
CREATE OR REPLACE FUNCTION get_daily_swipe_count(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT swipe_count INTO cnt FROM daily_swipes
  WHERE user_id = p_user_id AND swipe_date = CURRENT_DATE;

  RETURN COALESCE(cnt, 0);
END;
$$;

-- 8. RPC: Bloquear usuario
CREATE OR REPLACE FUNCTION block_user(p_blocker_id TEXT, p_blocked_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO blocked_users (blocker_id, blocked_id)
  VALUES (p_blocker_id, p_blocked_id)
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

-- 9. RPC: Desbloquear usuario
CREATE OR REPLACE FUNCTION unblock_user(p_blocker_id TEXT, p_blocked_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM blocked_users
  WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;
  RETURN FOUND;
END;
$$;

-- 10. RPC: Verificar si un usuario está bloqueado
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id TEXT, p_other_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_block BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = p_user_id AND blocked_id = p_other_id)
       OR (blocker_id = p_other_id AND blocked_id = p_user_id)
  ) INTO exists_block;
  RETURN exists_block;
END;
$$;

-- 11. RPC: Obtener usuarios bloqueados con perfil
CREATE OR REPLACE FUNCTION get_blocked_users(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', bu.id,
        'blocker_id', bu.blocker_id,
        'blocked_id', bu.blocked_id,
        'created_at', bu.created_at,
        'blocked_nickname', p.nickname,
        'blocked_avatar', p.avatar_url,
        'blocked_career', p.career
      )
      ORDER BY bu.created_at DESC
    )
    FROM blocked_users bu
    LEFT JOIN profiles p ON p.id = bu.blocked_id
    WHERE bu.blocker_id = p_user_id
  );
END;
$$;

-- 12. RPC: Obtener solicitudes enviadas por un usuario
CREATE OR REPLACE FUNCTION get_sent_requests(p_user_id TEXT)
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
        'receiver_nickname', p.nickname,
        'receiver_avatar', p.avatar_url,
        'receiver_career', p.career
      )
      ORDER BY fr.created_at DESC
    )
    FROM friend_requests fr
    LEFT JOIN profiles p ON p.id = fr.receiver_id
    WHERE fr.sender_id = p_user_id
    AND fr.status = 'pending'
  );
END;
$$;

-- 13. Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';
