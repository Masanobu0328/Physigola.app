// バリデーションユーティリティ

import type { TeamProfile, PlayerProfile } from "@/lib/logic/buildReview";

/**
 * チームプロフィールが完全かチェック
 */
export function isTeamProfileComplete(profile?: TeamProfile): boolean {
  if (!profile) return false;

  const required = [
    "category",
    "level",
    "weeklySessions",
    "matchFrequency",
    "policy",
  ] as const;

  const baseComplete = required.every((key) =>
    String(profile[key] || "").trim()
  );

  const daysOk =
    Array.isArray(profile.activeDays) && profile.activeDays.length > 0;

  return baseComplete && daysOk;
}

/**
 * 選手プロフィールが完全かチェック
 */
export function isPlayerProfileComplete(profile?: PlayerProfile): boolean {
  if (!profile) return false;

  const required = [
    "ageBand",
    "position",
    "dominantFoot",
    "playingStatus",
    "currentInjuryStatus",
  ] as const;

  const baseComplete = required.every((key) =>
    String(profile[key] || "").trim()
  );

  const pastInjuriesOk =
    Array.isArray(profile.pastInjuries) && profile.pastInjuries.length > 0;

  return baseComplete && pastInjuriesOk;
}

/**
 * RPEの範囲チェック
 */
export function isValidRPE(rpe: number): boolean {
  return rpe >= 0 && rpe <= 10;
}

/**
 * 分数の範囲チェック
 */
export function isValidMinutes(minutes: number): boolean {
  return minutes >= 0 && minutes <= 1440; // 24時間まで
}

