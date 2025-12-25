# Physiogora Judgment OS - MVP

スマホ1つで疲労・負荷を最短で記録し、選手の状態を可視化する判断支援アプリケーション。

## 🎯 MVPの目的

- **選手**: ログイン不要の入力URL（token）から背番号選択→当日入力（30秒）
- **管理者**: 選手一覧の状態（安定/注意/危険）＋個別選手の推移グラフ＋AIレビュー
- **チーム情報**（必須のみ）と**選手情報**（必須＋既往歴必須＋起用歴必須）をレビューに反映
- **監査ログ**（誰が入力/修正したか）必須
- 氏名などPIIは保持しない（匿名ID+背番号）

## 🏗️ 技術スタック

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Deploy**: Vercel

## 📁 プロジェクト構成

```
app/
├── login/                    # ログイン画面
├── admin/                    # Admin用ルート（認証保護）
│   ├── page.tsx             # 選手一覧（ホーム）
│   ├── players/[playerId]/  # 個別選手詳細
│   ├── settings/            # 設定（チーム・選手プロフィール）
│   └── invite-links/        # 選手入力URL管理
└── p/[token]/               # Player入力（公開URL）
    ├── page.tsx             # 背番号選択
    └── [playerId]/          # コンディション入力

components/
├── admin/                   # Admin専用コンポーネント
├── shared/                  # 共通コンポーネント
└── ui/                      # shadcn/ui基本コンポーネント

lib/
├── actions/                 # Server Actions
├── logic/                   # コアロジック
├── supabase/               # Supabase設定・型定義
├── utils/                   # ユーティリティ
└── constants/              # 定数

supabase/
└── migrations/             # DBマイグレーション

__tests__/
├── unit/                   # ユニットテスト
└── integration/            # 統合テスト
```

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトURLとAPIキーを取得

### 3. 環境変数の設定

`.env.local`ファイルを作成：

```bash
cp .env.local.example .env.local
```

以下の値を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. データベースマイグレーション

Supabase SQL Editorで以下のマイグレーションを順番に実行：

1. `supabase/migrations/20231215000000_initial_schema.sql`
2. `supabase/migrations/20231215000001_rls_policies.sql`

### 5. 初期データの作成（開発用）

Supabase SQL Editorで以下を実行してテストチームとAdmin userを作成：

```sql
-- チーム作成
INSERT INTO teams (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test Team');

-- Admin user作成（Supabase Authで先にユーザーを作成してからIDを使用）
-- 1. Supabase Dashboard > Authentication > Users で新規ユーザーを作成
-- 2. そのユーザーのIDを使って以下を実行

INSERT INTO admin_users (id, team_id, email, role) VALUES 
  ('your-auth-user-id', '00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin');

-- 選手作成（例）
INSERT INTO players (team_id, jersey_number) VALUES 
  ('00000000-0000-0000-0000-000000000001', 7),
  ('00000000-0000-0000-0000-000000000001', 10),
  ('00000000-0000-0000-0000-000000000001', 11);
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 📝 使い方

### Admin（管理者・トレーナー）

1. `/login` からログイン
2. ホーム画面で選手一覧を確認
3. 選手をクリックして詳細・グラフ・AIレビューを表示
4. 設定からチーム・選手プロフィールを入力
5. 選手入力URLを発行して選手に共有

### Player（選手）

1. 管理者から共有されたURL（`/p/[token]`）にアクセス
2. 自分の背番号を選択
3. RPE・時間・疲労・睡眠・痛みを入力（30秒）
4. 完了

## 🧪 テスト

### ユニットテスト実行

```bash
npm test
```

### テスト監視モード

```bash
npm run test:watch
```

## 📊 データモデル

### 主要テーブル

- **teams**: チーム情報
- **team_profiles**: チームプロフィール（必須項目）
- **players**: 選手（匿名ID + 背番号）
- **player_profiles**: 選手プロフィール（必須 + 既往歴 + 起用歴）
- **daily_conditions**: 日次コンディション（RPE, 時間, 疲労, 睡眠, 痛み）
- **team_invite_links**: 選手入力URL用トークン
- **audit_logs**: 監査ログ（全操作を記録）
- **admin_users**: 管理者ユーザー

### RLS（Row Level Security）

- チーム単位でデータを完全分離
- Admin: 自チームのデータのみ閲覧・編集可能
- Player: トークン経由で自チームへの入力のみ可能

## 🎨 デザイン

- **背景**: 白
- **アクセントカラー**: フィジゴラオレンジ（#df961a）
- **ステータス配色**:
  - 🟢 安定（GREEN）: emerald系
  - 🟡 注意（YELLOW）: amber系
  - 🔴 危険（RED）: rose系
- **ボタン文字**: 視認性保証（白×白を防ぐ）

## 🔧 コアロジック

### computeStatus（ステータス計算）

ルールベースで安定/注意/危険を判定：

- **sRPE** = RPE × 時間
- **スコアリング**:
  - sRPE >= 700: +2, >= 450: +1
  - 疲労 高: +2, 中: +1
  - 睡眠 悪: +2, 普通: +1
  - 動作フラグ: +1
- **判定**:
  - score >= 5: RED（危険）
  - score >= 3: YELLOW（注意）
  - それ以外: GREEN（安定）

### buildReviewWithProfiles（AIレビュー生成）

断定しないトーンで検討を促す：

- チーム方針（安全重視/バランス/強度重視）
- 起用歴（主力/交代中心/出場少/休養中）
- 現在の状態（問題なし/痛みあり/制限あり/リハビリ中/復帰直後）
- 既往歴（なし/足首/膝/ハム/股関節/腰/その他）

### 期間フィルター・比較

- **期間**: 1日/1週間/3週間/1ヶ月/1年
- **比較**: なし/前期間/去年

## 🔒 セキュリティ

- Supabase Auth + RLS でチーム分離
- 監査ログで全操作を記録
- トークン検証で選手入力を保護
- PII（個人識別情報）は保持しない

## 🚢 デプロイ（Vercel）

### 前提条件

- Supabaseプロジェクトが作成済み
- マイグレーションが実行済み
- GitHubリポジトリにプッシュ済み

### 1. Vercelプロジェクト作成

#### GitHubから自動デプロイ（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "Add New" > "Project" を選択
3. GitHubリポジトリをインポート
4. Framework Preset: **Next.js** が自動検出される
5. Root Directory: `./` (デフォルト)
6. Build Command: `npm run build` (デフォルト)
7. Output Directory: `.next` (デフォルト)

#### CLI経由（オプション）

```bash
npm install -g vercel
vercel
```

### 2. 環境変数設定

Vercel Dashboard > Settings > Environment Variables で以下を設定：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | ✅ 本番用 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | ✅ 本番用 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key（監査ログ用） | ✅ 本番用 |
| `NEXT_PUBLIC_APP_URL` | 本番URL（例: `https://your-app.vercel.app`） | 推奨 |

**重要**:
- 全ての環境変数を **Production**, **Preview**, **Development** の3環境全てにチェック
- `SUPABASE_SERVICE_ROLE_KEY` は絶対にクライアントコードで使用しないこと

### 3. ビルド設定確認

Vercel Dashboard > Settings > General:

```yaml
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 18.x (推奨)
```

### 4. デプロイ

#### 自動デプロイ（GitHubプッシュ時）

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

Vercelが自動的にデプロイを開始します。

#### 手動デプロイ（CLI）

```bash
vercel --prod
```

### 5. デプロイ後の確認

✅ チェックリスト:

1. **ビルド成功**: Vercel Dashboard > Deployments でステータス確認
2. **環境変数**: Settings > Environment Variables で全て設定済み
3. **ログイン画面**: `https://your-app.vercel.app/login` にアクセス
4. **Player URL**: `https://your-app.vercel.app/p/test-token` でエラーメッセージ表示

### デモモード（Supabase未設定）での動作

**環境変数が未設定でも以下は正常動作します**:

- ✅ `/login` - ログイン画面表示
- ✅ `/p/[token]` - エラーメッセージ「無効なトークンです」表示
- ✅ `/admin` → `/login` へリダイレクト

**Supabase設定後に利用可能**:

- 🔒 Admin認証
- 📊 選手データ管理
- 📈 グラフ・レビュー生成
- 🔗 選手入力URL発行

### トラブルシューティング

#### ビルドエラー「Type error」

```bash
# ローカルで確認
npm run build

# エラーが出る場合
npm run typecheck
```

#### 環境変数エラー

- Vercel Dashboard > Settings > Environment Variables を確認
- Redeploy（再デプロイ）で反映

#### Supabase接続エラー

- `.env.local`の値とVercelの環境変数が一致しているか確認
- Supabase Dashboard > Settings > API で正しいURLとKeyを取得

### パフォーマンス最適化

Vercel自動最適化:

- ✅ Edge Functions（Middleware）
- ✅ ISR（Incremental Static Regeneration）
- ✅ Image Optimization
- ✅ CDN配信

### コスト見積もり（Vercel Hobby Plan）

- **月額**: 無料
- **制限**:
  - 100GB帯域幅/月
  - 100時間ビルド時間/月
  - 1000ファンクション実行/日
- **MVP開発には十分**

---

### 本番運用前の最終チェック

- [ ] Supabaseマイグレーション実行済み
- [ ] RLSポリシー有効化済み
- [ ] Adminユーザー作成済み
- [ ] チーム・選手データ作成済み
- [ ] 本番環境変数設定済み
- [ ] `/login`でログイン成功
- [ ] 選手入力URLで入力成功
- [ ] 監査ログ記録確認

---

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

## 📄 ライセンス

Private - All Rights Reserved

---

**Physiogora Judgment OS** - スマホ1つで、選手の状態を可視化
