-- ============================================================
-- BM7621 SEO Workshop Companion — Supabase Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TEAMS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bm7621seo_teams (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  brand      TEXT NOT NULL CHECK (brand IN ('ASOS', 'Ryanair', 'Starbucks', 'Coca-Cola', 'Samsung')),
  members    JSONB NOT NULL DEFAULT '[]',
  cohort     TEXT DEFAULT '2024',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORKSPACE DATA ──────────────────────────────────────────
-- One row per team. Upserted on every autosave.
CREATE TABLE IF NOT EXISTS bm7621seo_workspace_data (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id    UUID NOT NULL REFERENCES bm7621seo_teams(id) ON DELETE CASCADE,
  scores     JSONB NOT NULL DEFAULT '{}',
  responses  JSONB NOT NULL DEFAULT '{}',
  simulators JSONB NOT NULL DEFAULT '{}',
  cmo_eval   JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id)
);

-- ─── EXPORTS LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bm7621seo_export_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID NOT NULL REFERENCES bm7621seo_teams(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_teams_code    ON bm7621seo_teams(code);
CREATE INDEX IF NOT EXISTS idx_teams_brand   ON bm7621seo_teams(brand);
CREATE INDEX IF NOT EXISTS idx_ws_team_id    ON bm7621seo_workspace_data(team_id);
CREATE INDEX IF NOT EXISTS idx_ws_updated    ON bm7621seo_workspace_data(updated_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE bm7621seo_teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bm7621seo_workspace_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE bm7621seo_export_log     ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write for workshop (no auth)
-- Teams: public read, no insert (seeded by facilitator)
CREATE POLICY "teams_public_read"
  ON bm7621seo_teams FOR SELECT USING (true);

-- Workspace data: public read and upsert
CREATE POLICY "workspace_public_select"
  ON bm7621seo_workspace_data FOR SELECT USING (true);

CREATE POLICY "workspace_public_insert"
  ON bm7621seo_workspace_data FOR INSERT WITH CHECK (true);

CREATE POLICY "workspace_public_update"
  ON bm7621seo_workspace_data FOR UPDATE USING (true);

-- Export log: public insert
CREATE POLICY "export_log_public_insert"
  ON bm7621seo_export_log FOR INSERT WITH CHECK (true);

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime on workspace_data for live leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE bm7621seo_workspace_data;

-- ─── SEED DATA ───────────────────────────────────────────────
-- Seed the 5 team access codes + facilitator
INSERT INTO bm7621seo_teams (code, name, brand, members) VALUES
  ('ALPHA24',       'Alpha Team',   'ASOS',      '[]'),
  ('BRAVO24',       'Bravo Team',   'Ryanair',   '[]'),
  ('CHARLIE24',     'Charlie Team', 'Starbucks', '[]'),
  ('DELTA24',       'Delta Team',   'Coca-Cola', '[]'),
  ('ECHO24',        'Echo Team',    'Samsung',   '[]')
ON CONFLICT (code) DO NOTHING;

-- ─── TRIGGER: update updated_at ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON bm7621seo_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workspace_updated_at
  BEFORE UPDATE ON bm7621seo_workspace_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
