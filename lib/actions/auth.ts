"use server";

// 認証関連のServer Actions

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AdminUser } from "@/lib/types/app";

/**
 * ログイン
 */
export async function login(email: string, password: string) {
  // 【重要】環境変数の実際の値を確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('=== Server Action: login ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'UNDEFINED');
  console.log('NEXT_PUBLIC_SUPABASE_URL type:', typeof supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_URL length:', supabaseUrl?.length || 0);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseKey);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', supabaseKey?.length || 0);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
  console.log('NEXT_PUBLIC_SUPABASE_URL includes xxxxx:', supabaseUrl?.includes('xxxxx') || false);
  console.log('===========================');

  // 環境変数チェック
  if (!supabaseUrl || supabaseUrl.includes('xxxxx') || supabaseUrl.includes('placeholder')) {
    console.error('❌ Invalid Supabase URL:', supabaseUrl);
    return { success: false, error: 'Supabase URLが正しく設定されていません' };
  }

  if (!supabaseKey || supabaseKey.includes('placeholder')) {
    console.error('❌ Invalid Supabase Key');
    return { success: false, error: 'Supabase Keyが正しく設定されていません' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'ログインに失敗しました' };
  }

  // Admin userレコードが存在するか確認
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (adminError || !adminUser) {
    console.error('Admin user check error:', adminError);
    await supabase.auth.signOut();
    return { success: false, error: adminError?.message || "管理者権限がありません" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * サインアップ
 */
export async function signUp(email: string, password: string, name: string) {
  const supabase = await createClient();

  // 1. ユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('SignUp error:', authError);
    return { success: false, error: authError?.message || 'アカウント作成に失敗しました' };
  }

  // 2. デフォルトチームを作成（Service Roleを使用）
  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: team, error: teamError } = await serviceSupabase
    .from("teams")
    .insert({ name: `${name}のチーム` })
    .select()
    .single();

  if (teamError || !team) {
    console.error('Team creation error:', teamError);
    return { success: false, error: `チーム作成に失敗しました: ${teamError?.message || '不明なエラー'}` };
  }

  // 3. admin_usersレコードを作成（Service Roleを使用）
  const { error: adminError } = await serviceSupabase
    .from("admin_users")
    .insert({
      id: authData.user.id,
      team_id: team.id,
      email: email,
      name: name,
      role: 'admin',
    });

  if (adminError) {
    console.error('Admin user creation error:', adminError);
    return { success: false, error: `管理者権限の設定に失敗しました: ${adminError.message}` };
  }

  return { success: true };
}

/**
 * ログアウト
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Admin userレコードを取得
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*, teams(id, name)")
    .eq("id", user.id)
    .single();

  return adminUser as AdminUser | null;
}

/**
 * 認証チェック（Admin専用ページ用）
 */
export async function requireAuth(): Promise<AdminUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

