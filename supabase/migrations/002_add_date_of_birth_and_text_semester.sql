-- ============================================================
-- Migración: Agregar date_of_birth y cambiar semester a TEXT
-- ============================================================

-- 1. Agregar columna date_of_birth 
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Cambiar semester de INTEGER a TEXT (para "Nivelación" y semestres variables)
-- Primero eliminar el CHECK constraint, luego cambiar el tipo
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_semester_check;
ALTER TABLE profiles ALTER COLUMN semester TYPE TEXT USING
  CASE WHEN semester IS NULL THEN NULL ELSE semester::text END;

-- 3. Índice nuevo para date_of_birth
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- 4. Desactivar RLS (Firebase Auth, no Supabase Auth — no hay JWT)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('semester', 'date_of_birth');
