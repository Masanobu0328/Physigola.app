# Supabase接続エラー デバッグガイド

## 🔍 問題の分析

### エラー内容
```
TypeError: fetch failed
getaddrinfo ENOTFOUND xxxxx.supabase.co
```

### 問題の本質
- **認証エラーではない**: Supabase Auth APIに到達する前の通信エラー
- **DNS解決失敗**: `getaddrinfo ENOTFOUND` = ホスト名が解決できない
- **環境変数の問題**: `xxxxx.supabase.co`というプレースホルダー値が残っている可能性

---

## 🎯 Next.js App Router + Supabase で「fetch failed」が起きる典型原因

### 1. 環境変数の読み込み問題（最有力）

#### 症状
- `getaddrinfo ENOTFOUND xxxxx.supabase.co`
- プレースホルダー値が残っている

#### 原因
- `.env.local`ファイルの値が正しく読み込まれていない
- Next.jsの環境変数キャッシュ
- サーバー再起動不足

#### 確認方法
```typescript
// Server Action内で直接確認
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('includes xxxxx:', process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('xxxxx'));
```

#### 解決方法
1. `.env.local`ファイルの内容を確認（プレースホルダーがないか）
2. サーバーを完全停止して再起動
3. Next.jsキャッシュをクリア: `rm -rf .next` または `rmdir /s .next` (Windows)

---

### 2. Server Action実行環境の問題

#### 症状
- Server Action内で`process.env`が`undefined`

#### 原因
- Next.js App RouterのServer Action実行環境
- ビルド時とランタイム時の環境変数の違い

#### 確認方法
```typescript
// Server Action内で確認
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('URL type:', typeof process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('URL === undefined:', process.env.NEXT_PUBLIC_SUPABASE_URL === undefined);
```

#### 解決方法
- `NEXT_PUBLIC_`プレフィックスが正しく付いているか確認
- 環境変数が`.env.local`に正しく記載されているか確認

---

### 3. Supabase Client初期化の問題

#### 症状
- `createClient()`が古い値を参照している

#### 原因
- モジュールレベルのキャッシュ
- `lib/supabase/server.ts`のフォールバック値が使用されている

#### 確認方法
```typescript
// lib/supabase/server.ts で確認
console.log('[server.ts] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('[server.ts] URL includes placeholder:', 
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder'));
```

#### 解決方法
- フォールバック値を削除して、明示的にエラーを投げる
- 環境変数が必須であることを明確にする

---

### 4. ネットワーク・DNS問題

#### 症状
- 正しいURLでも`ENOTFOUND`エラー

#### 原因
- ファイアウォール
- プロキシ設定
- DNS設定の問題

#### 確認方法
```bash
# コマンドラインで確認
nslookup ltwvhbotuxohfqljzlkx.supabase.co
ping ltwvhbotuxohfqljzlkx.supabase.co
```

#### 解決方法
- ネットワーク設定を確認
- プロキシ/VPNを一時的に無効化

---

### 5. Supabaseプロジェクトの状態

#### 症状
- 正しいURLでも接続できない

#### 原因
- プロジェクトが一時停止
- プロジェクトが削除された

#### 確認方法
- Supabase Dashboardにアクセス
- プロジェクトの状態を確認

---

## 🔧 今回の状況に最も一致する原因

**1. 環境変数の読み込み問題**（確率: 90%）

### 根拠
1. エラーログに`xxxxx.supabase.co`が表示されている
2. `.env.local`ファイルは正しく設定されているが、サーバーが古い値を参照している可能性
3. `lib/supabase/server.ts`のフォールバック値（`'https://placeholder.supabase.co'`）が使用される可能性

### 確認すべきこと
1. **Server Action内での環境変数の実際の値**
   - `lib/actions/auth.ts`の`login`関数内で`console.log`を追加済み
   - ターミナルのログを確認

2. **Supabase Client初期化時の環境変数**
   - `lib/supabase/server.ts`の`createClient`関数内で`console.log`を追加済み
   - ターミナルのログを確認

3. **最小限の接続テスト**
   - `lib/actions/test-supabase-connection.ts`を作成済み
   - ログイン画面の「🔍 Supabase接続テスト」ボタンで確認

---

## 🧪 疎通確認の手順

### ステップ1: 接続テストボタンを使用

1. ブラウザで `http://localhost:3000/login` を開く
2. 「🔍 Supabase接続テスト」ボタンをクリック
3. エラーメッセージエリアに結果が表示される

### ステップ2: ターミナルログを確認

接続テスト実行時、ターミナルに以下のログが表示される：

```
=== testSupabaseConnection Server Action ===
Raw env check:
  NEXT_PUBLIC_SUPABASE_URL: [実際の値]
  NEXT_PUBLIC_SUPABASE_URL type: string
  NEXT_PUBLIC_SUPABASE_URL === undefined: false
  Contains "xxxxx": [true/false]
  Contains "placeholder": [true/false]
  ...
```

### ステップ3: 問題の特定

#### ケースA: URLに`xxxxx`が含まれている
→ `.env.local`ファイルが正しく読み込まれていない
→ Next.jsキャッシュをクリアして再起動

#### ケースB: URLは正しいが`fetch failed`
→ ネットワーク問題またはSupabase側の問題
→ コマンドラインで`nslookup`や`ping`を確認

#### ケースC: URLが`undefined`
→ 環境変数が設定されていない
→ `.env.local`ファイルの内容を確認

---

## 🎯 最短の疎通確認コード

### 実装済み: `lib/actions/test-supabase-connection.ts`

このServer Actionは以下を実行します：

1. **環境変数の直接確認**
   - `process.env.NEXT_PUBLIC_SUPABASE_URL`の実際の値
   - プレースホルダーが含まれていないか

2. **最小限のfetchテスト**
   - Supabase REST APIの`/rest/v1/`エンドポイントにGETリクエスト
   - 認証は不要（Health Checkとして機能）

3. **詳細なエラー情報**
   - エラーの種類（`ENOTFOUND`, `ECONNREFUSED`など）
   - エラーの原因

### 使用方法

ログイン画面の「🔍 Supabase接続テスト」ボタンをクリックするだけです。

---

## 📊 診断フローチャート

```
接続テスト実行
    ↓
ターミナルログ確認
    ↓
URLに "xxxxx" が含まれている？
    ├─ Yes → .env.localの確認 → サーバー再起動 → Next.jsキャッシュクリア
    └─ No
        ↓
URLは正しい？
    ├─ No (undefined/null) → .env.localファイルの確認
    └─ Yes
        ↓
fetchが成功？
    ├─ Yes → ✅ 接続OK、認証ロジックの問題を確認
    └─ No → ネットワーク問題、Supabaseプロジェクトの状態を確認
```

---

## 🔍 追加の確認コマンド

### Windows PowerShell

```powershell
# DNS解決の確認
Resolve-DnsName ltwvhbotuxohfqljzlkx.supabase.co

# ネットワーク接続の確認
Test-NetConnection -ComputerName ltwvhbotuxohfqljzlkx.supabase.co -Port 443
```

### 環境変数の確認（Next.jsプロセス内）

```typescript
// Server Action内で実行
console.log('All NEXT_PUBLIC env vars:');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    console.log(`  ${key}: ${process.env[key]?.substring(0, 50)}...`);
  });
```

---

## ✅ 次のアクション

1. **接続テストを実行**
   - ログイン画面の「🔍 Supabase接続テスト」ボタンをクリック

2. **ターミナルログを確認**
   - 環境変数の実際の値を確認
   - エラーの詳細を確認

3. **問題に応じた対処**
   - ケースA: Next.jsキャッシュクリア + サーバー再起動
   - ケースB: ネットワーク設定の確認
   - ケースC: `.env.local`ファイルの再確認

