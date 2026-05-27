-- ============================================================
-- Migración 003: banner_url + tabla posts
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar banner_url a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Crear tabla de posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 4. Bucket posts (si no existe, créalo manualmente en Storage)
-- Ve a: Storage > Create bucket > Name: "posts" > Public bucket: ON
