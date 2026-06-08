-- ============================================================
-- Migration 006: Disable RLS on all tables (Firebase Auth)
-- ============================================================
-- Firebase Auth no proporciona JWT compatible con Supabase RLS,
-- por lo que desactivamos RLS en todas las tablas.
-- ============================================================

ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
