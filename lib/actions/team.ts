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

