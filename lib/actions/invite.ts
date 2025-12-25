"use server";

// 招待リンク関連のServer Actions

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { generateToken } from "@/lib/utils/token";
import { createAuditLog } from "@/lib/utils/audit";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type TeamInviteLinkInsert =
  Database["public"]["Tables"]["team_invite_links"]["Insert"];

/**
 * チームの招待リンク一覧を取得
 */
export async function getInviteLinks() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_invite_links")
    .select("*")
    .eq("team_id", user.team_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch invite links:", error);
    return [];
  }

  return data || [];
}

/**
 * 新しい招待リンクを作成
 */
export async function createInviteLink(expiresAt?: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const token = generateToken();

  const insertData: TeamInviteLinkInsert = {
    team_id: user.team_id,
    token,
    is_active: true,
    expires_at: expiresAt || null,
  };

  const { data, error } = (await supabase
    .from("team_invite_links")
    .insert(insertData as any)
    .select()
    .single()) as { data: any; error: any };

  if (error) {
    return { success: false, error: error.message };
  }

  // 監査ログ
  await createAuditLog({
    entityType: "team_invite_link",
    entityId: data.id,
    action: "create",
    actorRole: "admin",
    actorUserId: user.id,
    after: data,
  });

  revalidatePath("/admin/invite-links");
  return { success: true, data };
}

/**
 * 招待リンクを無効化
 */
export async function deactivateInviteLink(linkId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 既存データを取得
  const { data: existing } = await supabase
    .from("team_invite_links")
    .select("*")
    .eq("id", linkId)
    .eq("team_id", user.team_id)
    .single();

  if (!existing) {
    return { success: false, error: "招待リンクが見つかりません" };
  }

  const { data, error } = (await (supabase
    .from("team_invite_links") as any)
    .update({ is_active: false })
    .eq("id", linkId)
    .select()
    .single()) as { data: any; error: any };

  if (error) {
    return { success: false, error: error.message };
  }

  // 監査ログ
  await createAuditLog({
    entityType: "team_invite_link",
    entityId: linkId,
    action: "update",
    actorRole: "admin",
    actorUserId: user.id,
    before: existing,
    after: data,
  });

  revalidatePath("/admin/invite-links");
  return { success: true, data };
}

/**
 * トークンを検証してチーム情報を取得（Player用）
 */
export async function validateToken(token: string) {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("team_invite_links")
    .select("*, teams(id, name)")
    .eq("token", token)
    .eq("is_active", true)
    .single()) as { data: any; error: any };

  if (error || !data) {
    return { success: false, error: "無効なトークンです" };
  }

  // 有効期限チェック
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: "トークンの有効期限が切れています" };
  }

  return { success: true, data };
}

/**
 * トークンからチームの選手一覧を取得（Player用）
 */
export async function getPlayersByToken(token: string) {
  const validation = await validateToken(token);

  if (!validation.success || !validation.data) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("id, jersey_number")
    .eq("team_id", validation.data.team_id)
    .order("jersey_number", { ascending: true });

  if (error) {
    console.error("Failed to fetch players:", error);
    return [];
  }

  return data || [];
}

