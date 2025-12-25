// 監査ログユーティリティ

import { createServiceClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export interface CreateAuditLogParams {
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete";
  actorRole: "player" | "admin" | "system";
  actorUserId?: string | null;
  before?: any;
  after?: any;
}

/**
 * 監査ログを作成
 * Service Roleクライアントを使用してRLSをバイパス
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<void> {
  const supabase = createServiceClient();

  const logEntry: AuditLogInsert = {
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    actor_role: params.actorRole,
    actor_user_id: params.actorUserId || null,
    before: params.before ? JSON.parse(JSON.stringify(params.before)) : null,
    after: params.after ? JSON.parse(JSON.stringify(params.after)) : null,
  };

  const { error } = await (supabase.from("audit_logs") as any).insert(logEntry);

  if (error) {
    console.error("Failed to create audit log:", error);
    // 監査ログの失敗はエラーとして投げない（メイン処理を妨げない）
  }
}

/**
 * 監査ログ取得（Admin用）
 */
export async function getAuditLogs(params: {
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  const supabase = createServiceClient();

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.entityType) {
    query = query.eq("entity_type", params.entityType);
  }

  if (params.entityId) {
    query = query.eq("entity_id", params.entityId);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }

  return data || [];
}

