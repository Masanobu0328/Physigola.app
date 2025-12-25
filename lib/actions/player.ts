"use server";

// 選手関連のServer Actions

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { createAuditLog } from "@/lib/utils/audit";
import { normalizePastInjuries } from "@/lib/utils/injuries";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
type PlayerProfileInsert =
  Database["public"]["Tables"]["player_profiles"]["Insert"];
type PlayerProfileUpdate =
  Database["public"]["Tables"]["player_profiles"]["Update"];

/**
 * 選手一覧を取得
 */
export async function getPlayers() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("*, player_profiles(*)")
    .eq("team_id", user.team_id)
    .order("jersey_number", { ascending: true });

  if (error) {
    console.error("Failed to fetch players:", error);
    return [];
  }

  return data || [];
}

/**
 * 選手を作成
 */
export async function createPlayer(jerseyNumber: number) {
  const user = await requireAuth();
  const supabase = await createClient();

  const playerData: PlayerInsert = {
    team_id: user.team_id,
    jersey_number: jerseyNumber,
  };

  const { data: player, error } = (await supabase
    .from("players")
    .insert(playerData as any)
    .select()
    .single()) as { data: any; error: any };

  if (error) {
    return { success: false, error: error.message };
  }

  // 監査ログ
  await createAuditLog({
    entityType: "player",
    entityId: player.id,
    action: "create",
    actorRole: "admin",
    actorUserId: user.id,
    after: player,
  });

  revalidatePath("/admin");
  return { success: true, data: player };
}

/**
 * 選手プロフィールを取得
 */
export async function getPlayerProfile(playerId: string) {
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
    return null;
  }

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("player_id", playerId)
    .single();

  return profile;
}

/**
 * 選手プロフィールを保存（作成または更新）
 */
export async function savePlayerProfile(
  playerId: string,
  profileData: {
    ageBand: string;
    position: string;
    dominantFoot: string;
    playingStatus: string;
    currentInjuryStatus: string;
    pastInjuries: string[];
  }
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
    return { success: false, error: "選手が見つかりません" };
  }

  // 既往歴を正規化
  const normalizedInjuries = normalizePastInjuries(profileData.pastInjuries);

  // 既存プロフィールを取得
  const { data: existingProfile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("player_id", playerId)
    .single();

  if (existingProfile) {
    // 更新
    const updateData: PlayerProfileUpdate = {
      age_band: profileData.ageBand,
      position: profileData.position,
      dominant_foot: profileData.dominantFoot,
      playing_status: profileData.playingStatus,
      current_injury_status: profileData.currentInjuryStatus,
      past_injuries: normalizedInjuries,
    };

    const { data: updated, error } = await (supabase
      .from("player_profiles") as any)
      .update(updateData)
      .eq("player_id", playerId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "player_profile",
      entityId: playerId,
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
    const insertData: PlayerProfileInsert = {
      player_id: playerId,
      age_band: profileData.ageBand,
      position: profileData.position,
      dominant_foot: profileData.dominantFoot,
      playing_status: profileData.playingStatus,
      current_injury_status: profileData.currentInjuryStatus,
      past_injuries: normalizedInjuries,
    };

    const { data: created, error } = await supabase
      .from("player_profiles")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 監査ログ
    await createAuditLog({
      entityType: "player_profile",
      entityId: playerId,
      action: "create",
      actorRole: "admin",
      actorUserId: user.id,
      after: created,
    });

    revalidatePath("/admin");
    return { success: true, data: created };
  }
}

