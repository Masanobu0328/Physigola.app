-- 複数チーム管理機能の追加

-- admin_usersテーブルにユーザー名を追加
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name TEXT;

-- admin_usersテーブルの制約を変更（複数チームに所属可能にする）
-- 既存の制約: id (PRIMARY KEY), team_id (NOT NULL)
-- 新しい制約: (id, team_id) の組み合わせをユニークにする

-- 1. 既存のPRIMARY KEY制約を削除
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;

-- 2. 新しい複合PRIMARY KEYを追加
ALTER TABLE admin_users ADD PRIMARY KEY (id, team_id);

-- 3. インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);
