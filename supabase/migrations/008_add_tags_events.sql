-- ============================================================
-- Migration 008: tags on posts/stories + events table
-- ============================================================

-- 1. Add tags column to posts (TEXT[] for user IDs)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Add tags and description to stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
