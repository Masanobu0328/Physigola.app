# 詳細セットアップ手順

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

## ステップ1: リポジトリのクローン

```bash
git clone <repository-url>
cd physiogora-app
```

## ステップ2: 依存関係のインストール

```bash
npm install
```

## ステップ3: Supabaseプロジェクトのセットアップ

### 3.1 プロジェクト作成

1. [Supabase](https://supabase.com)にログイン
2. "New Project"をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. "Create new project"をクリック

### 3.2 APIキーの取得

1. Project Settings > API に移動
2. 以下をコピー：
   - Project URL
   - `anon` `public` key
   - `service_role` key（⚠️ 絶対に公開しない）

### 3.3 環境変数の設定

`.env.local`ファイルを作成：

```bash
cp .env.local.example .env.local
```

取得したAPIキーを設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ステップ4: データベースマイグレーション

### 4.1 スキーマ作成

Supabase Dashboard > SQL Editor を開き、以下のファイルの内容を順番に実行：

1. `supabase/migrations/20231215000000_initial_schema.sql`
   - テーブル作成
   - インデックス作成
   - トリガー設定

2. `supabase/migrations/20231215000001_rls_policies.sql`
   - RLSポリシー設定
   - ヘルパー関数作成

### 4.2 実行確認

SQL Editorで以下を実行して確認：

```sql
-- テーブル一覧
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- RLS有効確認
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

## ステップ5: 初期データの作成

### 5.1 Adminユーザーの作成

1. Supabase Dashboard > Authentication > Users
2. "Add user" > "Create new user"
3. メールアドレスとパスワードを設定
4. 作成されたユーザーのIDをコピー

### 5.2 チームとAdmin userレコードの作成

SQL Editorで以下を実行（`your-auth-user-id`を実際のIDに置き換え）：

```sql
-- チーム作成
INSERT INTO teams (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test Team U15');

-- Admin userレコード作成
INSERT INTO admin_users (id, team_id, email, role) VALUES 
  ('your-auth-user-id', '00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin');

-- チームプロフィール作成（オプション）
INSERT INTO team_profiles (team_id, category, level, weekly_sessions, match_frequency, active_days, policy) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'U15', 'クラブ（地域）', '3', '週1', ARRAY['火', '木', '土'], 'バランス');

-- 選手作成
INSERT INTO players (team_id, jersey_number) VALUES 
  ('00000000-0000-0000-0000-000000000001', 7),
  ('00000000-0000-0000-0000-000000000001', 10),
  ('00000000-0000-0000-0000-000000000001', 11),
  ('00000000-0000-0000-0000-000000000001', 4);
```

## ステップ6: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## ステップ7: 動作確認

### 7.1 Adminログイン

1. http://localhost:3000/login にアクセス
2. ステップ5.1で作成したメールアドレスとパスワードでログイン
3. ホーム画面が表示されることを確認

### 7.2 設定の入力

1. 右上の「設定」ボタンをクリック
2. チームタブでチーム情報を入力
3. 選手タブで各選手のプロフィールを入力

### 7.3 選手入力URLの発行

1. ホーム画面の「選手入力URL（共有用）」をクリック
2. 「新しいURLを発行」をクリック
3. 発行されたURLをコピー

### 7.4 選手入力のテスト

1. 別のブラウザ（またはシークレットモード）で発行したURLにアクセス
2. 背番号を選択
3. RPE、時間、疲労、睡眠、痛みを入力
4. 完了をクリック

### 7.5 データ確認

1. Admin画面に戻る
2. 入力した選手をクリック
3. グラフとAIレビューが表示されることを確認

## トラブルシューティング

### ログインできない

- Supabase Dashboard > Authentication > Users でユーザーが作成されているか確認
- `admin_users`テーブルにレコードがあるか確認
- `.env.local`の環境変数が正しいか確認

### RLSエラーが出る

- RLSポリシーが正しく設定されているか確認
- `get_admin_team_id()`などのヘルパー関数が作成されているか確認

### 選手入力URLが無効

- `team_invite_links`テーブルに`is_active = true`のレコードがあるか確認
- トークンが正しいか確認

### グラフが表示されない

- `daily_conditions`テーブルにデータがあるか確認
- ブラウザのコンソールでエラーが出ていないか確認

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`（本番URL）
4. デプロイ

### 本番環境での初期設定

1. 本番用のSupabaseプロジェクトを作成
2. マイグレーションを実行
3. Adminユーザーを作成
4. 環境変数を更新

## セキュリティチェックリスト

- [ ] `.env.local`がgitignoreに含まれている
- [ ] `SUPABASE_SERVICE_ROLE_KEY`が公開されていない
- [ ] RLSポリシーが有効になっている
- [ ] 本番環境で強力なパスワードを使用している
- [ ] HTTPSを使用している（本番環境）

## 次のステップ

- チーム・選手プロフィールを充実させる
- 定期的にデータをバックアップする
- 監査ログを定期的に確認する
- ユーザーフィードバックを収集する

