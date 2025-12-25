// コアロジック: AIレビュー生成
// プロトタイプから忠実に移植（断定禁止、「検討してください」トーン）

import type { Status } from "./computeStatus";

export interface TeamProfile {
  category: string;
  level: string;
  weeklySessions: string;
  matchFrequency: string;
  activeDays: string[];
  policy: string;
}

export interface PlayerProfile {
  ageBand: string;
  position: string;
  dominantFoot: string;
  playingStatus: string;
  currentInjuryStatus: string;
  pastInjuries: string[];
}

export interface ComparisonData {
  periodLabel: string; // "1週間前"、"3週間前"など
  avgSRPE: number | null; // 比較期間の平均sRPE
  currentAvgSRPE: number; // 現在の期間の平均sRPE
  avgFatigue: "低" | "中" | "高" | null; // 比較期間の平均疲労
  currentAvgFatigue: "低" | "中" | "高"; // 現在の期間の平均疲労
}

export interface BuildReviewParams {
  status: Status;
  trend: string;
  teamProfile?: TeamProfile;
  playerProfile?: PlayerProfile;
  comparison?: ComparisonData; // 比較情報（オプション）
}

/**
 * AIレビュー生成ロジック
 * MVP: 断定しないレビュー。将来APIで置換。
 * 
 * 文脈に含める情報:
 * - チーム方針（安全重視/バランス/強度重視）
 * - 起用歴（主力/交代中心/出場少/休養中）
 * - 現在の状態（問題なし/痛みあり/制限あり/リハビリ中/復帰直後）
 * - 既往歴（なし/足首/膝/ハム/股関節/腰/その他）
 */
export function buildReviewWithProfiles(params: BuildReviewParams): string {
  const { status, trend, teamProfile, playerProfile, comparison } = params;

  const policy = teamProfile?.policy;
  const playing = playerProfile?.playingStatus;
  const currentInjury = playerProfile?.currentInjuryStatus;
  const past = Array.isArray(playerProfile?.pastInjuries)
    ? playerProfile.pastInjuries
    : [];

  const hasPastInjury =
    past.length > 0 && !(past.length === 1 && past[0] === "なし");
  const isReturn = currentInjury === "復帰直後（2週間以内）";
  const isLimited =
    currentInjury === "制限あり" || currentInjury === "リハビリ中";
  const isPain = currentInjury === "痛みあり（プレー可）";

  // チーム方針に応じたトーン
  const tonePrefix =
    policy === "安全重視"
      ? "安全側で"
      : policy === "強度重視"
        ? "強度を維持しつつ"
        : "バランスを取りつつ";

  // プロフィール情報の注記
  const profileNote = (() => {
    const notes: string[] = [];
    if (playing) notes.push(`起用状況：${playing}。`);
    if (currentInjury) notes.push(`現在：${currentInjury}。`);
    if (hasPastInjury)
      notes.push(
        `既往歴（参考）：${past.filter((x) => x !== "なし").join("・")}。`
      );
    return notes.length ? notes.join(" ") : "";
  })();

  // プロフィールに基づく注意喚起
  const cautionByProfile = (() => {
    if (isLimited)
      return "制限がある前提で、負荷の上限を低めに設定することを検討してください。";
    if (isReturn)
      return "復帰直後は急な負荷増加を避け、強度の上げ方を段階的にすることを検討してください。";
    if (isPain || hasPastInjury)
      return "痛み/既往がある場合は、高強度の量を増やす前に回復状況の確認を優先してください。";
    return "";
  })();

  // 比較情報のテキスト生成
  const comparisonText = (() => {
    if (!comparison) return "";
    
    const parts: string[] = [];
    
    // sRPEの比較
    if (comparison.avgSRPE !== null) {
      const diff = comparison.currentAvgSRPE - comparison.avgSRPE;
      const diffPercent = comparison.avgSRPE > 0 
        ? Math.round((diff / comparison.avgSRPE) * 100) 
        : 0;
      
      if (Math.abs(diffPercent) >= 10) {
        if (diffPercent > 0) {
          parts.push(`${comparison.periodLabel}と比較して負荷が${Math.abs(diffPercent)}%増加しています`);
        } else {
          parts.push(`${comparison.periodLabel}と比較して負荷が${Math.abs(diffPercent)}%減少しています`);
        }
      }
    }
    
    // 疲労の比較
    if (comparison.avgFatigue !== null && comparison.currentAvgFatigue !== comparison.avgFatigue) {
      const fatigueLevels = { "低": 1, "中": 2, "高": 3 };
      const currentLevel = fatigueLevels[comparison.currentAvgFatigue];
      const prevLevel = fatigueLevels[comparison.avgFatigue];
      
      if (currentLevel > prevLevel) {
        parts.push(`疲労が${comparison.periodLabel}より高くなっています`);
      } else if (currentLevel < prevLevel) {
        parts.push(`疲労が${comparison.periodLabel}より改善しています`);
      }
    }
    
    return parts.length > 0 ? parts.join("。") + "。" : "";
  })();

  // 文章結合ヘルパー
  const join = (a: string, b: string) =>
    a ? `${a}${a.endsWith("。") ? "" : "。"} ${b}` : b;

  // ステータスに応じたレビュー
  let baseReview = "";
  if (status.key === "RED") {
    baseReview = `直近の負荷と主観疲労が高い状態です。${trend}${tonePrefix}高強度（特にスプリント/急減速）の量を一時的に調整し、回復時間の確保を検討してください。`;
  } else if (status.key === "YELLOW") {
    baseReview = `負荷が増加傾向で、疲労がやや蓄積している可能性があります。${trend}${tonePrefix}次回は高強度の量・本数を微調整し、翌日の回復（睡眠）を優先してください。`;
  } else {
    baseReview = `大きな問題は見られません。${trend}${tonePrefix}現状の強度を維持しつつ、疲労サイン（睡眠/痛み）に注意して継続してください。`;
  }

  // 比較情報を追加
  const reviewWithComparison = comparisonText 
    ? `${baseReview} ${comparisonText}`
    : baseReview;

  return join(
    profileNote,
    `${reviewWithComparison}${cautionByProfile ? " " + cautionByProfile : ""}`
  );
}

