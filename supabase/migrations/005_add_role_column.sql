-- ============================================================
-- Migration 005: Add role column to profiles
-- ============================================================

-- 1. Crear tipo enum para roles de usuario
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Agregar columna role a profiles con valor por defecto 'student'
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'student';

-- 3. Índice para filtrar/buscar por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Actualizar RLS: solo admin puede eliminar cualquier perfil
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (
    id = current_setting('request.jwt.claims')::json->>'sub'
    OR
    current_setting('request.jwt.claims')::json->>'role' = 'admin'
  );

-- 5. Política para que admin pueda actualizar cualquier perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (
    id = current_setting('request.jwt.claims')::json->>'sub'
    OR
    current_setting('request.jwt.claims')::json->>'role' = 'admin'
  );

-- 6. Bucket de avatars — políticas de Storage 
