# Supabase連携セットアップガイド

## 📋 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [APIキーの取得](#2-apiキーの取得)
3. [環境変数の設定](#3-環境変数の設定)
4. [データベースマイグレーション](#4-データベースマイグレーション)
5. [初期データの作成](#5-初期データの作成)
6. [動作確認](#6-動作確認)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. Supabaseプロジェクトの作成

### 手順

1. [Supabase](https://supabase.com) にアクセスしてログイン
2. 「New Project」をクリック
3. 以下を設定：
   - **Project Name**: 任意の名前（例: "physiogora-app"）
   - **Database Password**: 強力なパスワードを設定（⚠️ 忘れずに保存）
   - **Region**: 日本なら "Tokyo (Northeast Asia)" を推奨
4. 「Create new project」をクリック
5. プロジェクト作成完了まで待つ（2-3分）

---

## 2. APIキーの取得

### 手順

1. Supabase Dashboard → 左サイドバー → **「Settings」**（歯車アイコン）をクリック
2. **「API」** を選択
3. 以下の情報を取得：

#### Project URL
- セクション: "Project URL" または "Config"
- 例: `https://xxxxx.supabase.co`
- コピーして保存

#### API Keys（新しい形式）

Supabase Dashboardには2種類のAPIキーが表示される可能性があります：

##### A. 新しい形式のキー（推奨）

**Publishable key（anon key相当）**
- セクション: "Publishable key"
- 形式: `sb_publishable_...` で始まる
- 用途: クライアントサイドで使用（公開してもOK、RLSで保護）

**Secret key（service_role key相当）**
- セクション: "Secret keys"
- 形式: `sb_secret_...` で始まる
- 用途: サーバーサイドのみで使用（⚠️ 絶対に公開しない）
- 「Reveal」ボタンをクリックして表示

##### B. Legacy API Keys（旧形式）

もし「Legacy anon, service_role API keys」セクションがある場合：

**anon public key**
- 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` で始まる長い文字列
- 用途: クライアントサイドで使用

**service_role secret key**
- 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` で始まる長い文字列
- 用途: サーバーサイドのみで使用（⚠️ 絶対に公開しない）
- 「Reveal」ボタンをクリックして表示

### どちらを使うべきか？

- **新しい形式（sb_publishable_... / sb_secret_...）**: 最新のSupabaseプロジェクトで使用可能
- **Legacy形式（eyJ...）**: より互換性が高い（すべてのクライアントライブラリで動作）

**推奨**: まず新しい形式を試し、問題があればLegacy形式を使用

---

## 3. 環境変数の設定

### `.env.local`ファイルの作成

プロジェクトルート（`app`フォルダ）に`.env.local`ファイルを作成し、以下を設定：

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase Anonymous Key（新しい形式またはLegacy形式）
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_... または eyJhbGci...

# Supabase Service Role Key（新しい形式またはLegacy形式）
# ⚠️ このキーは絶対に公開しないでください！
SUPABASE_SERVICE_ROLE_KEY=sb_secret_... または eyJhbGci...

# アプリのURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 重要なポイント

1. **`xxxxx`を実際のプロジェクトIDに置き換える**
   - 例: `https://ltwvhbotuxohfqljzlkx.supabase.co`

2. **プレースホルダーを残さない**
   - ❌ `https://xxxxx.supabase.co`（プレースホルダーのまま）
   - ✅ `https://ltwvhbotuxohfqljzlkx.supabase.co`（実際のURL）

3. **Secret keyは完全に入力**
   - 途中で切れていないか確認

4. **環境変数を変更したら、必ずサーバーを再起動**
   - `Ctrl+C`で停止 → `npm run dev`で再起動

---

## 4. データベースマイグレーション

### 手順

1. Supabase Dashboard → 左サイドバー → **「SQL Editor」** をクリック
2. 「New query」をクリック
3. 1つ目のマイグレーションを実行：

   **ファイル**: `supabase/migrations/20231215000000_initial_schema.sql`
   - ファイルの内容をすべてコピー
   - SQL Editorに貼り付け
   - 「Run」ボタンをクリック
   - 「Success. No rows returned」と表示されれば成功

4. 2つ目のマイグレーションを実行：

   **ファイル**: `supabase/migrations/20231215000001_rls_policies.sql`
   - 新しいクエリを作成
   - ファイルの内容をすべてコピー
   - SQL Editorに貼り付け
   - 「Run」ボタンをクリック
   - 「Success. No rows returned」と表示されれば成功

### マイグレーションの確認

SQL Editorで以下を実行して確認：

```sql
-- テーブル一覧を確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- RLS有効確認
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 5. 初期データの作成

### ステップ1: Adminユーザーの作成

1. Supabase Dashboard → **「Authentication」** → **「Users」**
2. 「Add user」→「Create new user」をクリック
3. 以下を設定：
   - **Email**: 任意のメールアドレス（例: `admin@example.com`）
   - **Password**: 任意のパスワード（⚠️ 忘れずに保存）
   - **「Auto Confirm User」**にチェック（すぐにログインできるように）
4. 「Create user」をクリック
5. 作成されたユーザーの**ID（UUID）**をコピー（後で使用）

### ステップ2: SQL Editorで初期データを作成

1. Supabase Dashboard → **「SQL Editor」**
2. 新しいクエリを作成
3. 以下のSQLを実行（`your-auth-user-id`をステップ1でコピーしたIDに置き換える）：

```sql
-- チーム作成
INSERT INTO teams (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test Team U15');

-- Admin userレコード作成
INSERT INTO admin_users (id, team_id, email, role) VALUES 
  ('your-auth-user-id', '00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin');
```

4. メールアドレスも実際の値に置き換える
5. 「Run」ボタンをクリック
6. 「Success. No rows returned」と表示されれば成功

### 確認

```sql
-- admin_usersテーブルの確認
SELECT * FROM admin_users;

-- teamsテーブルの確認
SELECT * FROM teams;
```

---

## 6. 動作確認

### 開発サーバーの起動

```bash
npm run dev
```

### ログイン確認

1. ブラウザで `http://localhost:3000/login` を開く
2. ステップ5で作成したメールアドレスとパスワードを入力
3. 「ログイン」ボタンをクリック
4. Admin画面に遷移すれば成功

---

## 7. トラブルシューティング

### エラー: "fetch failed" または "getaddrinfo ENOTFOUND xxxxx.supabase.co"

**原因**: 環境変数のURLがプレースホルダーのまま

**解決方法**:
1. `.env.local`ファイルを確認
2. `NEXT_PUBLIC_SUPABASE_URL`が実際のURLになっているか確認
3. `xxxxx`ではなく、実際のプロジェクトIDが入っているか確認
4. サーバーを再起動

### エラー: "管理者権限がありません"

**原因**: `admin_users`テーブルにレコードがない

**解決方法**:
1. Supabase Dashboard → SQL Editor
2. `SELECT * FROM admin_users;` を実行
3. レコードがない場合は、ステップ5を再度実行

### エラー: ログイン画面に戻る

**原因**: 認証は成功しているが、`admin_users`テーブルからの取得に失敗

**確認方法**:
1. Supabase Dashboard → Authentication → Users
2. ユーザーが作成されているか確認
3. ユーザーIDをコピー
4. SQL Editorで `SELECT * FROM admin_users WHERE id = 'ユーザーID';` を実行
5. レコードがない場合は、ステップ5を再度実行

### 環境変数が反映されない

**解決方法**:
1. `.env.local`ファイルを保存
2. 開発サーバーを完全に停止（Ctrl+C）
3. 再度起動: `npm run dev`
4. ターミナルのログで環境変数が読み込まれているか確認

### 新しいAPIキー形式が動作しない場合

**解決方法**:
1. Supabase Dashboard → Settings → API
2. 「Legacy anon, service_role API keys」セクションを探す
3. Legacyキーがある場合は、それを使用
4. `.env.local`ファイルを更新
5. サーバーを再起動

---

## ✅ チェックリスト

セットアップ完了後の確認項目：

- [ ] Supabaseプロジェクトが作成されている
- [ ] APIキーを取得済み（Project URL、anon key、service_role key）
- [ ] `.env.local`ファイルに環境変数を設定（プレースホルダーなし）
- [ ] マイグレーション（スキーマ）を実行済み
- [ ] マイグレーション（RLSポリシー）を実行済み
- [ ] Adminユーザーを作成済み（Supabase Authentication）
- [ ] `admin_users`テーブルにレコードを作成済み
- [ ] 開発サーバーを再起動済み
- [ ] ログインが成功する

---

## 📝 次のステップ

セットアップが完了したら：

1. チームプロフィールを設定
2. 選手を追加
3. 選手入力URLを発行
4. データ入力をテスト

---

## 🔒 セキュリティ注意事項

- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しない
- ⚠️ `.env.local`ファイルは`.gitignore`に含まれている（Gitにコミットしない）
- ⚠️ 本番環境では、環境変数をVercel Dashboardなどで設定する
- ⚠️ 本番用Supabaseプロジェクトは別途作成することを推奨

---

## 📚 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js環境変数](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [@supabase/ssr ドキュメント](https://supabase.com/docs/guides/auth/server-side/nextjs)

