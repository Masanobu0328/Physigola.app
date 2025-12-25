// 期間フィルターロジック
// プロトタイプから忠実に移植

import { addDays, parseISO, format } from "date-fns";

export type PeriodKey = "1d" | "7d" | "21d" | "30d" | "365d";

export interface PeriodRange {
  key: PeriodKey;
  label: string;
  days: number;
}

export const PERIOD_RANGES: PeriodRange[] = [
  { key: "1d", label: "1日", days: 1 },
  { key: "7d", label: "1週間", days: 7 },
  { key: "21d", label: "3週間", days: 21 },
  { key: "30d", label: "1ヶ月", days: 30 },
  { key: "365d", label: "1年", days: 365 },
];

/**
 * 日付文字列をローカルDateに変換（タイムゾーンずれ回避）
 */
export function parseYmd(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * DateをYYYY-MM-DD形式に変換
 */
export function yyyyMmDd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * MM/DD形式に変換
 */
export function formatMd(dateStr: string): string {
  const date = parseYmd(dateStr);
  return format(date, "M/d");
}

/**
 * 指定期間の日付配列を生成
 */
export function generateDateRange(endDate: Date, days: number): string[] {
  const dates: string[] = [];
  const startDate = addDays(endDate, -(days - 1));

  for (let i = 0; i < days; i++) {
    dates.push(yyyyMmDd(addDays(startDate, i)));
  }

  return dates;
}

/**
 * 疲労レベルをスコアに変換（グラフ表示用）
 */
export function toScoreFatigue(v: "低" | "中" | "高"): number {
  if (v === "高") return 3;
  if (v === "中") return 2;
  return 1;
}

/**
 * 睡眠品質をスコアに変換（グラフ表示用）
 * 悪いほど高いスコア
 */
export function toScoreSleep(v: "良" | "普通" | "悪"): number {
  if (v === "悪") return 3;
  if (v === "普通") return 2;
  return 1;
}

