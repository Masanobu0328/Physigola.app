"use server";

// コンディション入力関連のServer Actions

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { createAuditLog } from "@/lib/utils/audit";
import { isValidRPE, isValidMinutes } from "@/lib/utils/validation";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type DailyConditionInsert =
  Database["public"]["Tables"]["daily_conditions"]["Insert"];
type DailyConditionUpdate =
  Database["public"]["Tables"]["daily_conditions"]["Update"];

/**
 * 選手のコンディション履歴を取得
 */
export async function getPlayerConditions(
  playerId: string,
  limit?: number,
  startDate?: string,
  endDate?: string
) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 選手がチームに属しているか確認
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .eq("team_id", user.team_id)
    .single();

  if (!player) {
    return [];
  }

  let query = supabase
    .from("daily_conditions")
    .select("*")
    .eq("player_id", playerId)
    .order("date", { ascending: false });

  if (startDate) {
    query = query.gte("date", startDate);
  }

  if (endDate) {
    query = query.lte("date", endDate);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch conditions:", error);
    return [];
  }

  return data || [];
}

/**
 * コンディションを保存（Admin用）
 */
export async function saveConditionAsAdmin(
  playerId: string,
  conditionData: {
    date: string;
    rpe: number;
    minutes: number;
    fatigue: "低" | "中" | "高";
    sleep: "良" | "普通" | "悪";
    pain: "なし" | "あり";
    painSites?: string;
    comment?: string;
  }
) {
  const user = await requireAuth();
  const supabase = await createClient();

  // バリデーション
  if (!isValidRPE(conditionData.rpe)) {
    return { success: false, error: "RPEは0-10の範囲で入力してください" };
  }

  if (!isValidMinutes(conditionData.minutes)) {
    return { success: false, error: "時間は0-1440分の範囲で入力してください" };
  }

  // 選手がチームに属しているか確認
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .eq("team_id", user.team_id)
    .single();

  if (!player) {
    return { success: false, error: "選手が見つかりません" };
  }

  // 既存データを確認
  const { data: existing } = (await supabase
    .from("daily_conditions")
    .select("*")
    .eq("player_id", playerId)
    .eq("date", conditionData.date)
    .single()) as { data: any; error: any };

  const insertData: DailyConditionInsert = {
    player_id: playerId,
    date: conditionData.date,
    rpe: conditionData.rpe,
    minutes: conditionData.minutes,
    fatigue: conditionData.fatigue,
    sleep: conditionData.sleep,
    pain: conditionData.pain,
    pain_sites: conditionData.painSites || null,
    comment: conditionData.comment || null,
    created_by_role: "admin",
    created_by_user_id: user.id,
  };

  if (existing) {
    // 更新: IDを含めてupsertを使用
    const { data: result, error } = (await supabase
      .from("daily_conditions")
      .upsert({ ...insertData, id: existing.id } as any)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "daily_condition",
      entityId: result.id,
      action: "update",
      actorRole: "admin",
      actorUserId: user.id,
      before: existing,
      after: result,
    });

    revalidatePath("/admin");
    return { success: true, data: result };
  } else {
    // 作成
    const { data: created, error } = (await supabase
      .from("daily_conditions")
      .insert(insertData as any)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "daily_condition",
      entityId: created.id,
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
 * コンディションを保存（Player用・トークン経由）
 */
export async function saveConditionAsPlayer(
  token: string,
  playerId: string,
  conditionData: {
    date: string;
    rpe: number;
    minutes: number;
    fatigue: "低" | "中" | "高";
    sleep: "良" | "普通" | "悪";
    pain: "なし" | "あり";
    painSites?: string;
    comment?: string;
  }
) {
  const supabase = await createClient();

  // トークン検証
  const { data: inviteLink } = (await supabase
    .from("team_invite_links")
    .select("*, teams(id)")
    .eq("token", token)
    .eq("is_active", true)
    .single()) as { data: any; error: any };

  if (!inviteLink) {
    return { success: false, error: "無効なトークンです" };
  }

  // 有効期限チェック
  if (
    inviteLink.expires_at &&
    new Date(inviteLink.expires_at) < new Date()
  ) {
    return { success: false, error: "トークンの有効期限が切れています" };
  }

  // 選手がチームに属しているか確認
  const { data: player } = (await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .eq("team_id", inviteLink.team_id)
    .single()) as { data: any; error: any };

  if (!player) {
    return { success: false, error: "選手が見つかりません" };
  }

  // バリデーション
  if (!isValidRPE(conditionData.rpe)) {
    return { success: false, error: "RPEは0-10の範囲で入力してください" };
  }

  if (!isValidMinutes(conditionData.minutes)) {
    return { success: false, error: "時間は0-1440分の範囲で入力してください" };
  }

  // 既存データを確認
  const { data: existing } = (await supabase
    .from("daily_conditions")
    .select("*")
    .eq("player_id", playerId)
    .eq("date", conditionData.date)
    .single()) as { data: any; error: any };

  const insertData: DailyConditionInsert = {
    player_id: playerId,
    date: conditionData.date,
    rpe: conditionData.rpe,
    minutes: conditionData.minutes,
    fatigue: conditionData.fatigue,
    sleep: conditionData.sleep,
    pain: conditionData.pain,
    pain_sites: conditionData.painSites || null,
    comment: conditionData.comment || null,
    created_by_role: "player",
    created_by_user_id: null,
  };

  if (existing) {
    // 更新: IDを含めてupsertを使用
    const { data: result, error } = (await supabase
      .from("daily_conditions")
      .upsert({ ...insertData, id: existing.id } as any)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "daily_condition",
      entityId: result.id,
      action: "update",
      actorRole: "player",
      after: result,
      before: existing,
    });

    return { success: true, data: result };
  } else {
    // 作成
    const { data: created, error } = (await supabase
      .from("daily_conditions")
      .insert(insertData as any)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "daily_condition",
      entityId: created.id,
      action: "create",
      actorRole: "player",
      after: created,
    });

    return { success: true, data: created };
  }
}

