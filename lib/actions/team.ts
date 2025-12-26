"use server";

// チーム関連のServer Actions

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { createAuditLog } from "@/lib/utils/audit";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type TeamProfileInsert =
  Database["public"]["Tables"]["team_profiles"]["Insert"];
type TeamProfileUpdate =
  Database["public"]["Tables"]["team_profiles"]["Update"];

/**
 * チーム情報を取得
 */
export async function getTeam() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", user.team_id)
    .single();

  if (error) {
    console.error("Failed to fetch team:", error);
    return null;
  }

  return data;
}

/**
 * チーム名を更新
 */
export async function updateTeamName(name: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 既存チーム情報を取得
  const { data: existingTeam } = await supabase
    .from("teams")
    .select("*")
    .eq("id", user.team_id)
    .single();

  if (!existingTeam) {
    return { success: false, error: "チームが見つかりません" };
  }

  const { data: updated, error } = await (supabase
    .from("teams") as any)
    .update({ name })
    .eq("id", user.team_id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // 監査ログ
  await createAuditLog({
    entityType: "team",
    entityId: user.team_id,
    action: "update",
    actorRole: "admin",
    actorUserId: user.id,
    before: existingTeam,
    after: updated,
  });

  revalidatePath("/admin");
  return { success: true, data: updated };
}

/**
 * チームプロフィールを取得
 */
export async function getTeamProfile() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_profiles")
    .select("*")
    .eq("team_id", user.team_id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found
    console.error("Failed to fetch team profile:", error);
    return null;
  }

  return data;
}

/**
 * チームプロフィールを保存（作成または更新）
 */
export async function saveTeamProfile(profileData: {
  category: string;
  level: string;
  weeklySessions: string;
  matchFrequency: string;
  activeDays: string[];
  policy: string;
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 既存プロフィールを取得
  const { data: existingProfile } = await supabase
    .from("team_profiles")
    .select("*")
    .eq("team_id", user.team_id)
    .single();

  if (existingProfile) {
    // 更新
    const updateData: TeamProfileUpdate = {
      category: profileData.category,
      level: profileData.level,
      weekly_sessions: profileData.weeklySessions,
      match_frequency: profileData.matchFrequency,
      active_days: profileData.activeDays,
      policy: profileData.policy,
    };

    const { data: updated, error } = await (supabase
      .from("team_profiles") as any)
      .update(updateData)
      .eq("team_id", user.team_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "team_profile",
      entityId: user.team_id,
      action: "update",
      actorRole: "admin",
      actorUserId: user.id,
      before: existingProfile,
      after: updated,
    });

    revalidatePath("/admin");
    return { success: true, data: updated };
  } else {
    // 作成
    const insertData: TeamProfileInsert = {
      team_id: user.team_id,
      category: profileData.category,
      level: profileData.level,
      weekly_sessions: profileData.weeklySessions,
      match_frequency: profileData.matchFrequency,
      active_days: profileData.activeDays,
      policy: profileData.policy,
    };

    const { data: created, error } = await supabase
      .from("team_profiles")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "team_profile",
      entityId: user.team_id,
      action: "create",
      actorRole: "admin",
      actorUserId: user.id,
      after: created,
    });

    revalidatePath("/admin");
    return { success: true, data: created };
  }
}

/**
 * ユーザーが所属する全チームを取得
 */
export async function getUserTeams() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("team_id, teams(id, name)")
    .eq("id", user.id);

  if (error) {
    console.error("Failed to fetch user teams:", error);
    return [];
  }

  return data.map((item: any) => item.teams).filter(Boolean);
}

/**
 * 新しいチームを作成
 */
export async function createNewTeam(teamName: string) {
  const user = await requireAuth();

  // Service Roleクライアントを使用
  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. チームを作成
  const { data: team, error: teamError } = await serviceSupabase
    .from("teams")
    .insert({ name: teamName })
    .select()
    .single();

  if (teamError || !team) {
    console.error("Team creation error:", teamError);
    return { success: false, error: teamError?.message || "チーム作成に失敗しました" };
  }

  // 2. admin_usersレコードを作成（現在のユーザーを管理者として追加）
  const { error: adminError } = await serviceSupabase
    .from("admin_users")
    .insert({
      id: user.id,
      team_id: team.id,
      email: user.email,
      name: user.name || null,
      role: 'admin',
    });

  if (adminError) {
    console.error("Admin user creation error:", adminError);
    return { success: false, error: adminError.message || "管理者権限の設定に失敗しました" };
  }

  // 監査ログ
  await createAuditLog({
    entityType: "team",
    entityId: team.id,
    action: "create",
    actorRole: "admin",
    actorUserId: user.id,
    after: team,
  });

  revalidatePath("/admin");
  return { success: true, data: team };
}


