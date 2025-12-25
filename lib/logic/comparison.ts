// 比較ロジック（前期間/去年）
// プロトタイプから忠実に移植

import { addDays } from "date-fns";
import { parseYmd, yyyyMmDd } from "./periodFilter";

export type ComparisonKey = "none" | "prev" | "yoy";

export interface ComparisonOption {
  key: ComparisonKey;
  label: string;
}

export const COMPARISON_OPTIONS: ComparisonOption[] = [
  { key: "none", label: "比較なし" },
  { key: "prev", label: "前期間と比較" },
  { key: "yoy", label: "去年と比較" },
];

/**
 * 比較用の日付を計算
 * @param date 基準日
 * @param compareKey 比較タイプ
 * @param periodDays 期間の日数（前期間比較用）
 */
export function getComparisonDate(
  date: string,
  compareKey: ComparisonKey,
  periodDays: number
): string | null {
  if (compareKey === "none") return null;

  const baseDate = parseYmd(date);

  if (compareKey === "prev") {
    // 前期間: 期間の日数分だけ過去にシフト
    return yyyyMmDd(addDays(baseDate, -periodDays));
  }

  if (compareKey === "yoy") {
    // 去年: 365日前
    return yyyyMmDd(addDays(baseDate, -365));
  }

  return null;
}

/**
 * 比較用のシフト日数を取得
 */
export function getComparisonShiftDays(
  compareKey: ComparisonKey,
  periodDays: number
): number {
  if (compareKey === "prev") return periodDays;
  if (compareKey === "yoy") return 365;
  return 0;
}

