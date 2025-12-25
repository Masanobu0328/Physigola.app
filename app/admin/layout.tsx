// Admin Layout（認証チェック）

import { requireAuth } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 開発用: Supabase未設定時は認証スキップ
  // 環境変数が未設定またはplaceholderの場合はデモモード
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isDemoMode = !supabaseUrl || 
                     supabaseUrl.includes('placeholder') ||
                     supabaseUrl === '';

  if (!isDemoMode) {
    // 本番モード: 認証チェック
    await requireAuth();
  } else {
    // デモモード: 認証スキップ（開発用）
    console.log('[Admin Layout] Demo mode: authentication skipped');
  }

  return <>{children}</>;
}

