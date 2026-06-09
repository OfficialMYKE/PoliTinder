-- ============================================================
-- Migration 007: Reports + System Settings tables
-- ============================================================

-- 1. Tabla de reportes de incidencias
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10 AND char_length(reason) <= 500),
  description TEXT CHECK (char_length(description) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 2. Tabla de configuracion del sistema (clave-valor)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT REFERENCES profiles(id)
);

-- Insertar valores por defecto
INSERT INTO system_settings (key, value, description) VALUES
  ('platform_name', 'PoliTinder', 'Nombre de la plataforma'),
  ('support_email', 'soporte@politinder.com', 'Correo de soporte'),
  ('maintenance_mode', 'false', 'Modo mantenimiento (true/false)'),
  ('max_post_length', '500', 'Longitud maxima de publicaciones'),
  ('max_bio_length', '280', 'Longitud maxima de biografia')
ON CONFLICT (key) DO NOTHING;

-- 3. Tabla de actividad de usuarios (para estadisticas)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_log(created_at DESC);

-- 4. Vista: Reportes con nombres de usuario
CREATE OR REPLACE VIEW reports_with_profiles AS
SELECT
  r.*,
  reporter.nickname AS reporter_nickname,
  reporter.avatar_url AS reporter_avatar,
  reported.nickname AS reported_nickname,
  reported.avatar_url AS reported_avatar,
  resolver.nickname AS resolver_nickname
FROM reports r
LEFT JOIN profiles reporter ON reporter.id = r.reporter_id
LEFT JOIN profiles reported ON reported.id = r.reported_id
LEFT JOIN profiles resolver ON resolver.id = r.resolved_by
ORDER BY r.created_at DESC;

-- 5. Vista: Estadisticas del sistema
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
  (SELECT COUNT(*) FROM stories) AS active_stories;

-- 6. Desactivar RLS (Firebase Auth, no hay JWT de Supabase)
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;
