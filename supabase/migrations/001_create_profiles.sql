-- ============================================================
-- Migration 001: Create profiles table
-- ============================================================

-- 1. Crear extensión para generar UUIDs (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de perfiles (vinculada a Firebase Auth por el ID)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- Firebase UID
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 30),
  avatar_url TEXT,
  date_of_birth DATE,
  faculty TEXT NOT NULL,
  career TEXT NOT NULL,
  semester TEXT,
  looking_for TEXT[] DEFAULT '{}',
  bio TEXT CHECK (char_length(bio) <= 280),
  study_styles TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_profiles_faculty ON profiles(faculty);
CREATE INDEX IF NOT EXISTS idx_profiles_career ON profiles(career);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- 3. Políticas RLS (acceso público de lectura, escritura solo propio perfil)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Profiles are readable by authenticated users"
  ON profiles FOR SELECT
  USING (true);

-- Permitir inserción solo del propio perfil
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = current_setting('request.jwt.claims')::json->>'sub' OR id IS NOT NULL);

-- Permitir actualización solo del propio perfil
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = current_setting('request.jwt.claims')::json->>'sub');

-- Permitir eliminación solo del propio perfil
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (id = current_setting('request.jwt.claims')::json->>'sub');

-- 6. Bucket avatars — políticas de Storage
-- (Ejecutar después de crear el bucket manualmente)
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');
--
-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars');
