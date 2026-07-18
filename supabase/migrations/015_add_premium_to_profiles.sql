-- Migración 015: Agregar columnas de Premium a profiles
-- Agrega soporte para planes premium y tracking de pagos

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS premium_plan TEXT DEFAULT NULL;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN profiles.is_premium IS 'Indica si el usuario tiene una suscripción premium activa';
COMMENT ON COLUMN profiles.premium_plan IS 'Plan premium del usuario: premium, premium_plus, o null';
COMMENT ON COLUMN profiles.premium_since IS 'Fecha desde la cual el usuario tiene premium activo';

-- Índice para búsquedas rápidas de usuarios premium
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles (is_premium) WHERE is_premium = TRUE;
