-- ============================================================
-- Migration 009: Story interactions (likes, replies, mutes)
-- ============================================================

-- 1. Tabla de likes en historias
CREATE TABLE IF NOT EXISTS story_likes (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);

-- 2. Tabla de respuestas a historias
CREATE TABLE IF NOT EXISTS story_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_replies_story_id ON story_replies(story_id);
CREATE INDEX IF NOT EXISTS idx_story_replies_user_id ON story_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_story_replies_created_at ON story_replies(created_at DESC);

-- 3. Tabla de usuarios silenciados
CREATE TABLE IF NOT EXISTS user_mutes (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  muted_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, muted_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_mutes_user_id ON user_mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_muted_user_id ON user_mutes(muted_user_id);

-- 4. Vista: respuestas con perfil del autor
CREATE OR REPLACE VIEW story_replies_with_profiles AS
SELECT
  sr.*,
  p.nickname AS author_nickname,
  p.avatar_url AS author_avatar
FROM story_replies sr
LEFT JOIN profiles p ON p.id = sr.user_id
ORDER BY sr.created_at DESC;

-- 5. Actualizar vista de estadisticas del sistema para incluir stories activas
CREATE OR REPLACE VIEW system_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) AS total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'student') AS students_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'moderator') AS moderators_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') AS admins_count,
  (SELECT COUNT(*) FROM posts) AS total_posts,
  (SELECT COUNT(*) FROM post_comments) AS total_comments,
  (SELECT COUNT(*) FROM post_likes) AS total_likes,
  (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
  (SELECT COUNT(*) FROM reports) AS total_reports,
  (SELECT COUNT(*) FROM stories WHERE expires_at > NOW()) AS active_stories;

-- 6. Desactivar RLS (Firebase Auth, no hay JWT de Supabase)
ALTER TABLE story_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_mutes DISABLE ROW LEVEL SECURITY;
