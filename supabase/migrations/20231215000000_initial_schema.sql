-- フィジゴラ 判断OSアプリ MVP - 初期スキーマ
-- 目的: チーム単位のデータ分離、匿名ID+背番号、監査ログ必須

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Teams テーブル
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Team Profiles テーブル（必須項目のみ）
-- ============================================
CREATE TABLE team_profiles (
  team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- U12, U15, U18, 大学, 社会人
  level TEXT NOT NULL, -- 部活, クラブ（地域）, クラブ（強化）, セミプロ相当
  weekly_sessions TEXT NOT NULL, -- 1, 2, 3, 4, 5, 6+
  match_frequency TEXT NOT NULL, -- 週0, 2週に1, 週1, 週2+
  active_days TEXT[] NOT NULL DEFAULT '{}', -- 月, 火, 水, 木, 金, 土, 日
  policy TEXT NOT NULL, -- 安全重視, バランス, 強度重視
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Players テーブル（匿名ID + 背番号）
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  jersey_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- ============================================
-- Player Profiles テーブル（必須 + 既往歴必須 + 起用歴必須）
-- ============================================
CREATE TABLE player_profiles (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  age_band TEXT NOT NULL, -- 小学生, 中学生, 高校生, 大学生, 社会人
  position TEXT NOT NULL, -- GK, DF, MF, FW
  dominant_foot TEXT NOT NULL, -- 右, 左, 両
  playing_status TEXT NOT NULL, -- 主力（長時間）, 交代中心, 出場少, 休養中
  current_injury_status TEXT NOT NULL, -- 問題なし, 痛みあり（プレー可）, 制限あり, リハビリ中, 復帰直後（2週間以内）
  past_injuries TEXT[] NOT NULL DEFAULT '{"なし"}', -- なし, 足首, 膝, ハム, 股関節, 腰, その他（最低1つ必須）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT past_injuries_not_empty CHECK (array_length(past_injuries, 1) > 0)
);

-- ============================================
-- Daily Conditions テーブル
-- ============================================
CREATE TABLE daily_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rpe INTEGER NOT NULL CHECK (rpe >= 0 AND rpe <= 10),
  minutes INTEGER NOT NULL CHECK (minutes >= 0),
  srpe INTEGER GENERATED ALWAYS AS (rpe * minutes) STORED,
  fatigue TEXT NOT NULL CHECK (fatigue IN ('低', '中', '高')),
  sleep TEXT NOT NULL CHECK (sleep IN ('良', '普通', '悪')),
  pain TEXT NOT NULL CHECK (pain IN ('なし', 'あり')),
  pain_sites TEXT,
  comment TEXT,
  created_by_role TEXT NOT NULL CHECK (created_by_role IN ('player', 'admin')),
  created_by_user_id UUID, -- adminの場合のみ設定
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, date)
);

-- Index for faster queries
CREATE INDEX idx_daily_conditions_player_date ON daily_conditions(player_id, date DESC);
CREATE INDEX idx_daily_conditions_date ON daily_conditions(date DESC);

-- ============================================
-- Team Invite Links テーブル（選手入力URL用）
-- ============================================
CREATE TABLE team_invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX idx_team_invite_links_token ON team_invite_links(token) WHERE is_active = TRUE;

-- ============================================
-- Audit Logs テーブル（監査ログ必須）
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- daily_condition, player_profile, team_profile, etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- create, update, delete
  actor_role TEXT NOT NULL CHECK (actor_role IN ('player', 'admin', 'system')),
  actor_user_id UUID, -- adminの場合のみ設定
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- Admin Users テーブル（Supabase Authと連携）
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'trainer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for team lookup
CREATE INDEX idx_admin_users_team ON admin_users(team_id);

-- ============================================
-- Updated At トリガー関数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_profiles_updated_at BEFORE UPDATE ON team_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_profiles_updated_at BEFORE UPDATE ON player_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_conditions_updated_at BEFORE UPDATE ON daily_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invite_links_updated_at BEFORE UPDATE ON team_invite_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

