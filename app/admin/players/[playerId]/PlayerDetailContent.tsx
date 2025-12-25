"use client";

// 選手詳細コンテンツ（Client Component）

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton, OrangeOutlineButton } from "@/components/shared/OrangeButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlayerChart } from "@/components/admin/PlayerChart";
import { BRAND } from "@/lib/constants/theme";
import { computeStatus } from "@/lib/logic/computeStatus";
import { buildReviewWithProfiles, type ComparisonData } from "@/lib/logic/buildReview";
import type { TeamProfile, PlayerProfile } from "@/lib/logic/buildReview";
import { PERIOD_RANGES, type PeriodKey } from "@/lib/logic/periodFilter";
import { parseYmd, yyyyMmDd } from "@/lib/logic/periodFilter";
import { addDays } from "date-fns";

interface PlayerDetailContentProps {
  player: any;
  user: any;
  allConditions: any[];
  teamProfile?: TeamProfile;
  playerProfile?: PlayerProfile;
  profileComplete: boolean;
  isDemoMode: boolean;
}

export function PlayerDetailContent({
  player,
  user,
  allConditions,
  teamProfile,
  playerProfile,
  profileComplete,
  isDemoMode,
}: PlayerDetailContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("7d");

  // 全期間の最新コンディションを取得（ステータス表示用）
  const globalLatestCondition = useMemo(() => {
    if (allConditions.length === 0) return null;
    // デモモードでは古い順にソートされているので、最新は最後の要素
    // 本番モードでは新しい順にソートされているので、最新は最初の要素
    return isDemoMode
      ? allConditions[allConditions.length - 1]
      : allConditions[0];
  }, [allConditions, isDemoMode]);

  // 期間に応じたデータをフィルタリング（グラフとAIレビュー用）
  const { filteredConditions, comparisonData } = useMemo(() => {
    if (allConditions.length === 0) {
      return { filteredConditions: [], comparisonData: undefined };
    }

    // 最新の日付を取得
    const latestDate = isDemoMode
      ? allConditions[allConditions.length - 1]?.date
      : allConditions[0]?.date;

    if (!latestDate) {
      return { filteredConditions: [], comparisonData: undefined };
    }

    const latestDateObj = parseYmd(latestDate);
    const periodRange = PERIOD_RANGES.find((r) => r.key === selectedPeriod) || PERIOD_RANGES[1];
    const periodDays = periodRange.days;

    // 期間内のデータをフィルタリング
    const startDate = addDays(latestDateObj, -(periodDays - 1));
    const startDateStr = yyyyMmDd(startDate);

    const filtered = allConditions.filter((c) => {
      const conditionDate = c.date;
      return conditionDate >= startDateStr && conditionDate <= latestDate;
    });

    // 日付順にソート（古い順）
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // 比較期間のデータを計算
    let comparison: ComparisonData | undefined = undefined;
    if (filtered.length > 0) {
      const comparisonStartDate = addDays(latestDateObj, -(periodDays * 2 - 1));
      const comparisonEndDate = addDays(latestDateObj, -periodDays);
      const comparisonStartStr = yyyyMmDd(comparisonStartDate);
      const comparisonEndStr = yyyyMmDd(comparisonEndDate);

      const comparisonConditions = allConditions.filter((c) => {
        const conditionDate = c.date;
        return conditionDate >= comparisonStartStr && conditionDate <= comparisonEndStr;
      });

      if (comparisonConditions.length > 0) {
        // 現在期間の平均sRPEと疲労
        const currentSRPEs = filtered
          .map((c) => c.rpe * c.minutes)
          .filter((v) => !isNaN(v) && v > 0);
        const currentAvgSRPE =
          currentSRPEs.length > 0
            ? currentSRPEs.reduce((a, b) => a + b, 0) / currentSRPEs.length
            : 0;

        const currentFatigues = filtered
          .map((c) => c.fatigue)
          .filter((f) => f === "低" || f === "中" || f === "高");
        const currentAvgFatigue = getAverageFatigue(currentFatigues);

        // 比較期間の平均sRPEと疲労
        const comparisonSRPEs = comparisonConditions
          .map((c) => c.rpe * c.minutes)
          .filter((v) => !isNaN(v) && v > 0);
        const avgSRPE =
          comparisonSRPEs.length > 0
            ? comparisonSRPEs.reduce((a, b) => a + b, 0) / comparisonSRPEs.length
            : null;

        const comparisonFatigues = comparisonConditions
          .map((c) => c.fatigue)
          .filter((f) => f === "低" || f === "中" || f === "高");
        const avgFatigue = getAverageFatigue(comparisonFatigues);

        const periodLabel =
          selectedPeriod === "7d"
            ? "1週間前"
            : selectedPeriod === "21d"
              ? "3週間前"
              : selectedPeriod === "30d"
                ? "1ヶ月前"
                : selectedPeriod === "365d"
                  ? "1年前"
                  : "前期間";

        comparison = {
          periodLabel,
          avgSRPE,
          currentAvgSRPE,
          avgFatigue,
          currentAvgFatigue,
        };
      }
    }

    return { filteredConditions: filtered, comparisonData: comparison };
  }, [allConditions, selectedPeriod, isDemoMode]);

  // ステータス計算（全期間の最新コンディションを使用）
  const status = globalLatestCondition
    ? computeStatus({
        rpe: globalLatestCondition.rpe,
        minutes: globalLatestCondition.minutes,
        fatigue: globalLatestCondition.fatigue,
        sleep: globalLatestCondition.sleep,
      })
    : { key: "GREEN" as const, label: "🟢 安定", tone: "", chip: "" };

  // AIレビュー生成
  const review = buildReviewWithProfiles({
    status,
    trend: "直近で",
    teamProfile,
    playerProfile,
    comparison: comparisonData,
  });

  const srpe = globalLatestCondition
    ? Math.round(globalLatestCondition.rpe * globalLatestCondition.minutes)
    : 0;

  return (
    <div className="min-h-screen w-full bg-white p-4 md:p-8">
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    aria-label="戻る"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="leading-tight">
                  <div className="text-sm text-muted-foreground">Team</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {user?.teams?.name || "チーム"}
                  </div>
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                MVP
              </Badge>
            </div>

            {/* Title with Period Selection */}
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-xl font-semibold">
                  選手詳細（No.{player.jersey_number}）
                </div>
                <div className="text-sm text-muted-foreground">
                  推移グラフ + AIレビュー
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERIOD_RANGES.map((period) =>
                  period.key === selectedPeriod ? (
                    <OrangeButton
                      key={period.key}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                    >
                      {period.label}
                    </OrangeButton>
                  ) : (
                    <OrangeOutlineButton
                      key={period.key}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                    >
                      {period.label}
                    </OrangeOutlineButton>
                  )
                )}
              </div>
            </div>

            <Separator />

            {/* Profile Warning */}
            {!profileComplete && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "rgba(223,150,26,0.35)",
                  background: "rgba(223,150,26,0.06)",
                }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: BRAND.ORANGE }}
                >
                  選手プロフィール（必須）が未設定です
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  「年代/ポジション/利き足/起用歴/現在の状態/既往歴」を入力してください。
                </div>
                <div className="mt-3">
                  <Link href={`/admin/players/${player.id}/settings`}>
                    <OrangeButton>
                      <Settings className="h-4 w-4 mr-2" /> 選手設定へ
                    </OrangeButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Status & Review */}
            <div className={`rounded-2xl border p-4 ${status.tone}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">現在のステータス</div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-2 text-sm">{review}</div>
            </div>

            {/* KPIs */}
            {globalLatestCondition && (
              <div className="grid grid-cols-3 gap-2">
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    borderColor: "rgba(223,150,26,0.25)",
                    background: "rgba(223,150,26,0.06)",
                  }}
                >
                  <div className="text-xs text-muted-foreground">sRPE</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {srpe}
                  </div>
                </div>
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    borderColor: "rgba(223,150,26,0.25)",
                    background: "rgba(223,150,26,0.06)",
                  }}
                >
                  <div className="text-xs text-muted-foreground">疲労</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {globalLatestCondition.fatigue}
                  </div>
                </div>
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    borderColor: "rgba(223,150,26,0.25)",
                    background: "rgba(223,150,26,0.06)",
                  }}
                >
                  <div className="text-xs text-muted-foreground">睡眠</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {globalLatestCondition.sleep}
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <PlayerChart history={filteredConditions} initialPeriod={selectedPeriod} />

            {/* Actions */}
            <div className="grid gap-2">
              <Link href={`/admin/players/${player.id}/settings`}>
                <Button className="w-full rounded-2xl" variant="outline">
                  <Settings className="h-4 w-4 mr-2" /> 選手設定
                </Button>
              </Link>
              <Link href={`/admin/players/${player.id}/input`}>
                <OrangeButton className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> 今日の入力（代理入力）
                </OrangeButton>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 疲労レベルの平均を計算
function getAverageFatigue(fatigues: ("低" | "中" | "高")[]): "低" | "中" | "高" {
  if (fatigues.length === 0) return "中";
  
  const levels = { "低": 1, "中": 2, "高": 3 };
  const sum = fatigues.reduce((acc, f) => acc + levels[f], 0);
  const avg = sum / fatigues.length;
  
  if (avg <= 1.5) return "低";
  if (avg <= 2.5) return "中";
  return "高";
}

