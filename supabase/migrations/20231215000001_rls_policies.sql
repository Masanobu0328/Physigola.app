-- フィジゴラ 判断OSアプリ MVP - RLSポリシー
-- 目的: チーム分離、Admin/Player権限管理

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions
-- ============================================

-- Get team_id for current admin user
CREATE OR REPLACE FUNCTION get_admin_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM admin_users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if current user is admin for a team
CREATE OR REPLACE FUNCTION is_admin_for_team(target_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND team_id = target_team_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get team_id from valid invite token
CREATE OR REPLACE FUNCTION get_team_id_from_token(invite_token TEXT)
RETURNS UUID AS $$
  SELECT team_id FROM team_invite_links 
  WHERE token = invite_token 
    AND is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW());
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- Teams Policies
-- ============================================

-- Admin can view their own team
CREATE POLICY "Admin can view own team"
  ON teams FOR SELECT
  USING (id = get_admin_team_id());

-- Admin can update their own team
CREATE POLICY "Admin can update own team"
  ON teams FOR UPDATE
  USING (id = get_admin_team_id());

-- ============================================
-- Team Profiles Policies
-- ============================================

-- Admin can view their team profile
CREATE POLICY "Admin can view own team profile"
  ON team_profiles FOR SELECT
  USING (team_id = get_admin_team_id());

-- Admin can insert their team profile
CREATE POLICY "Admin can insert own team profile"
  ON team_profiles FOR INSERT
  WITH CHECK (team_id = get_admin_team_id());

-- Admin can update their team profile
CREATE POLICY "Admin can update own team profile"
  ON team_profiles FOR UPDATE
  USING (team_id = get_admin_team_id());

-- ============================================
-- Players Policies
-- ============================================

-- Admin can view players in their team
CREATE POLICY "Admin can view own team players"
  ON players FOR SELECT
  USING (team_id = get_admin_team_id());

-- Admin can insert players in their team
CREATE POLICY "Admin can insert own team players"
  ON players FOR INSERT
  WITH CHECK (team_id = get_admin_team_id());

-- Admin can update players in their team
CREATE POLICY "Admin can update own team players"
  ON players FOR UPDATE
  USING (team_id = get_admin_team_id());

-- Admin can delete players in their team
CREATE POLICY "Admin can delete own team players"
  ON players FOR DELETE
  USING (team_id = get_admin_team_id());

-- ============================================
-- Player Profiles Policies
-- ============================================

-- Admin can view player profiles in their team
CREATE POLICY "Admin can view own team player profiles"
  ON player_profiles FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = player_profiles.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- Admin can insert player profiles in their team
CREATE POLICY "Admin can insert own team player profiles"
  ON player_profiles FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = player_profiles.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- Admin can update player profiles in their team
CREATE POLICY "Admin can update own team player profiles"
  ON player_profiles FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = player_profiles.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- ============================================
-- Daily Conditions Policies
-- ============================================

-- Admin can view daily conditions in their team
CREATE POLICY "Admin can view own team daily conditions"
  ON daily_conditions FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = daily_conditions.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- Admin can insert daily conditions in their team
CREATE POLICY "Admin can insert own team daily conditions"
  ON daily_conditions FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = daily_conditions.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- Admin can update daily conditions in their team
CREATE POLICY "Admin can update own team daily conditions"
  ON daily_conditions FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM players 
      WHERE players.id = daily_conditions.player_id 
        AND players.team_id = get_admin_team_id()
    )
  );

-- Player can insert daily conditions via valid token (handled in application layer)
-- Note: Player access is validated via token in Server Actions, not RLS

-- ============================================
-- Team Invite Links Policies
-- ============================================

-- Admin can view their team's invite links
CREATE POLICY "Admin can view own team invite links"
  ON team_invite_links FOR SELECT
  USING (team_id = get_admin_team_id());

-- Admin can insert invite links for their team
CREATE POLICY "Admin can insert own team invite links"
  ON team_invite_links FOR INSERT
  WITH CHECK (team_id = get_admin_team_id());

-- Admin can update their team's invite links
CREATE POLICY "Admin can update own team invite links"
  ON team_invite_links FOR UPDATE
  USING (team_id = get_admin_team_id());

-- Admin can delete their team's invite links
CREATE POLICY "Admin can delete own team invite links"
  ON team_invite_links FOR DELETE
  USING (team_id = get_admin_team_id());

-- Public can read active invite links (for token validation)
CREATE POLICY "Public can read active invite links"
  ON team_invite_links FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- ============================================
-- Audit Logs Policies
-- ============================================

-- Admin can view audit logs for their team's entities
CREATE POLICY "Admin can view own team audit logs"
  ON audit_logs FOR SELECT
  USING (
    -- Check if the entity belongs to admin's team
    CASE entity_type
      WHEN 'daily_condition' THEN
        EXISTS(
          SELECT 1 FROM daily_conditions dc
          JOIN players p ON p.id = dc.player_id
          WHERE dc.id = audit_logs.entity_id 
            AND p.team_id = get_admin_team_id()
        )
      WHEN 'player_profile' THEN
        EXISTS(
          SELECT 1 FROM player_profiles pp
          JOIN players p ON p.id = pp.player_id
          WHERE pp.player_id = audit_logs.entity_id 
            AND p.team_id = get_admin_team_id()
        )
      WHEN 'team_profile' THEN
        audit_logs.entity_id = get_admin_team_id()
      ELSE FALSE
    END
  );

-- System can insert audit logs (via service role)
-- Note: Audit log insertion is handled by Server Actions with service role

-- ============================================
-- Admin Users Policies
-- ============================================

-- Admin can view their own record
CREATE POLICY "Admin can view own record"
  ON admin_users FOR SELECT
  USING (id = auth.uid());

-- Admin can view other admins in their team
CREATE POLICY "Admin can view team admins"
  ON admin_users FOR SELECT
  USING (team_id = get_admin_team_id());

