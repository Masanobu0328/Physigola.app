// コアロジック: ステータス計算（安定/注意/危険）
// プロトタイプから忠実に移植

export type StatusKey = "GREEN" | "YELLOW" | "RED";

export type Status = {
  key: StatusKey;
  label: string;
  tone: string;
  chip: string;
};

export const STATUS: Record<StatusKey, Status> = {
  GREEN: {
    key: "GREEN",
    label: "🟢 安定",
    tone: "bg-emerald-50 border-emerald-200",
    chip: "bg-emerald-100 text-emerald-900",
  },
  YELLOW: {
    key: "YELLOW",
    label: "🟡 注意",
    tone: "bg-amber-50 border-amber-200",
    chip: "bg-amber-100 text-amber-900",
  },
  RED: {
    key: "RED",
    label: "🔴 危険",
    tone: "bg-rose-50 border-rose-200",
    chip: "bg-rose-100 text-rose-900",
  },
};

export type FatigueLevel = "低" | "中" | "高";
export type SleepQuality = "良" | "普通" | "悪";

export interface ComputeStatusArgs {
  rpe: number | string;
  minutes: number | string;
  fatigue: FatigueLevel;
  sleep: SleepQuality;
  movementFlag?: boolean;
}

/**
 * ステータス計算ロジック
 * MVP: ルールベース（断定しない）
 * 
 * スコアリング:
 * - sRPE >= 700: +2, >= 450: +1
 * - 疲労 高: +2, 中: +1
 * - 睡眠 悪: +2, 普通: +1
 * - 動作フラグ: +1
 * 
 * 判定:
 * - score >= 5: RED (危険)
 * - score >= 3: YELLOW (注意)
 * - それ以外: GREEN (安定)
 */
export function computeStatus(args: ComputeStatusArgs): Status {
  const sRPE = (Number(args.rpe) || 0) * (Number(args.minutes) || 0);
  let score = 0;

  // sRPE による加点
  if (sRPE >= 700) score += 2;
  else if (sRPE >= 450) score += 1;

  // 疲労による加点
  if (args.fatigue === "高") score += 2;
  else if (args.fatigue === "中") score += 1;

  // 睡眠による加点
  if (args.sleep === "悪") score += 2;
  else if (args.sleep === "普通") score += 1;

  // 動作フラグによる加点
  if (args.movementFlag) score += 1;

  // 判定
  if (score >= 5) return STATUS.RED;
  if (score >= 3) return STATUS.YELLOW;
  return STATUS.GREEN;
}

