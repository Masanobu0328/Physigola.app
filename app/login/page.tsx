"use client";

// ログイン画面

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { BRAND } from "@/lib/constants/theme";
import { login } from "@/lib/actions/auth";
import { testSupabaseConnection } from "@/lib/actions/test-supabase-connection";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "ログインに失敗しました");
    }

    setLoading(false);
  };

  // 開発用: デモモードでログインスキップ
  const handleDevLogin = () => {
    setLoading(true);
    // Supabase未設定時でもチーム選択画面に遷移
    router.push("/admin/select-team");
  };

  // Supabase接続テスト
  const handleTestConnection = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        setError(`✅ 接続成功: Status ${result.status}`);
      } else {
        setError(`❌ 接続失敗: ${result.error}${result.errorCode ? ` (${result.errorCode})` : ''}`);
      }
    } catch (err: any) {
      setError(`❌ テストエラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full space-y-4">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">ログイン</div>
                <div className="text-sm text-muted-foreground">
                  管理者・トレーナー用
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                MVP
              </Badge>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "rgba(223,150,26,0.25)",
                background: "rgba(223,150,26,0.06)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: BRAND.ORANGE }} />
                <div className="text-sm font-semibold" style={{ color: BRAND.ORANGE }}>
                  Physiogora Judgment OS
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                チーム単位でデータを管理。選手の状態を可視化し、負荷管理をサポートします。
              </div>
            </div>

            <div className="space-y-2">
              <Label>メールアドレス</Label>
              <Input
                className="rounded-2xl"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label>パスワード</Label>
              <Input
                className="rounded-2xl"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-2xl">
                {error}
              </div>
            )}

            <OrangeButton
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </OrangeButton>

            {/* 開発用ボタン */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-dashed" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  開発用
                </span>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={loading}
              type="button"
              className="w-full text-sm font-medium py-3 border-2 border-blue-200 rounded-2xl transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Supabase接続テスト
            </button>

            <button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full text-sm font-medium py-3 border-2 border-dashed rounded-2xl transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: loading ? '#e5e7eb' : '#fbbf24' }}
            >
              🔧 デモモードで入る（認証スキップ）
            </button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">アカウントをお持ちでない場合は </span>
              <a href="/signup" className="text-orange-600 hover:underline font-medium">
                新規登録
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

