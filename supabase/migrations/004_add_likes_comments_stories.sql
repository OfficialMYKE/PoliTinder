-- ============================================================
-- Migration 004: post_likes, post_comments, stories + buckets
-- ============================================================

-- 1. Tabla de likes en posts
CREATE TABLE IF NOT EXISTS post_likes (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 2. Tabla de comentarios en posts
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- 3. Tabla de historias (stories)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- 4. Vistas útiles
-- Posts con conteo de likes y comentarios
CREATE OR REPLACE VIEW posts_with_counts AS
SELECT
  p.*,
  COALESCE(l.likes_count, 0) AS likes_count,
  COALESCE(c.comments_count, 0) AS comments_count
FROM posts p
LEFT JOIN (
  SELECT post_id, COUNT(*) AS likes_count FROM post_likes GROUP BY post_id
) l ON l.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS comments_count FROM post_comments GROUP BY post_id
) c ON c.post_id = p.id
ORDER BY p.created_at DESC;

-- 5. Buckets de Storage (crear manualmente en el dashboard de Supabase)
--   - Bucket "stories" → Public bucket: ON
--   - Bucket "posts" → Public bucket: ON (si no existe ya)
