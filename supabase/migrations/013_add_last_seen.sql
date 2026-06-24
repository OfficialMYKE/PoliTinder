-- Migración 013: Agrega last_seen_at a profiles
-- Permite saber cuándo fue la última vez que un usuario estuvo en línea.
-- El valor lo actualiza el servicio de presencia (presence.ts) cuando el
-- usuario cierra la pestaña, cambia de página o se desconecta del canal.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
