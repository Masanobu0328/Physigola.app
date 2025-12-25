"use client";

// 選手推移グラフコンポーネント

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { OrangeButton, OrangeOutlineButton } from "@/components/shared/OrangeButton";
import { BRAND } from "@/lib/constants/theme";
import {
  PERIOD_RANGES,
  generateDateRange,
  formatMd,
  toScoreFatigue,
  toScoreSleep,
  parseYmd,
  yyyyMmDd,
} from "@/lib/logic/periodFilter";
import {
  COMPARISON_OPTIONS,
  getComparisonShiftDays,
} from "@/lib/logic/comparison";
import type { PeriodKey } from "@/lib/logic/periodFilter";
import type { ComparisonKey } from "@/lib/logic/comparison";
import { addDays } from "date-fns";

interface DailyCondition {
  date: string;
  rpe: number;
  minutes: number;
  fatigue: "低" | "中" | "高";
  sleep: "良" | "普通" | "悪";
}

interface PlayerChartProps {
  history: DailyCondition[];
  initialPeriod?: PeriodKey;
}

export function PlayerChart({ history, initialPeriod = "21d" }: PlayerChartProps) {
  const [rangeKey, setRangeKey] = useState<PeriodKey>(initialPeriod);
  const [compareKey, setCompareKey] = useState<ComparisonKey>("none");

  // initialPeriodが変更されたら更新
  useEffect(() => {
    if (initialPeriod) {
      setRangeKey(initialPeriod);
    }
  }, [initialPeriod]);

  const range = useMemo(
    () => PERIOD_RANGES.find((r) => r.key === rangeKey) || PERIOD_RANGES[2],
    [rangeKey]
  );

  const compare = useMemo(
    () =>
      COMPARISON_OPTIONS.find((c) => c.key === compareKey) ||
      COMPARISON_OPTIONS[0],
    [compareKey]
  );

  const mapByDate = useMemo(() => {
    const m = new Map<string, DailyCondition>();
    for (const x of history) m.set(x.date, x);
    return m;
  }, [history]);

  const chartData = useMemo(() => {
    const endStr = history[history.length - 1]?.date || yyyyMmDd(new Date());
    const endDate = parseYmd(endStr);
    const dates = generateDateRange(endDate, range.days);

    const shiftDays = getComparisonShiftDays(compareKey, range.days);

    return dates.map((date) => {
      const main = mapByDate.get(date);
      const cmpDate = shiftDays
        ? yyyyMmDd(addDays(parseYmd(date), -shiftDays))
        : null;
      const cmp = cmpDate ? mapByDate.get(cmpDate) : null;

      const sRPE = main ? Math.round(main.rpe * main.minutes) : null;
      const sRPE_cmp = cmp ? Math.round(cmp.rpe * cmp.minutes) : null;

      return {
        date,
        md: formatMd(date),
        sRPE,
        sRPE_cmp,
        fatigue: main ? toScoreFatigue(main.fatigue) : null,
        sleep: main ? toScoreSleep(main.sleep) : null,
        cmpLabel: cmpDate,
      };
    });
  }, [history, mapByDate, range.days, compareKey]);

  const srpeMax = useMemo(() => {
    const m1 = Math.max(
      0,
      ...chartData.map((d) => (typeof d.sRPE === "number" ? d.sRPE : 0))
    );
    const m2 = Math.max(
      0,
      ...chartData.map((d) => (typeof d.sRPE_cmp === "number" ? d.sRPE_cmp : 0))
    );
    const m = Math.max(m1, m2);
    return Math.max(600, Math.ceil(m / 100) * 100);
  }, [chartData]);

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">推移グラフ</div>
          <div className="text-xs text-muted-foreground">
            期間：{range.label}／比較：{compare.label}
            （比較はsRPEのみ重ね表示）
          </div>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {range.key}
        </Badge>
      </div>

      <div className="mt-3 space-y-3">
        {/* Comparison Selection */}
        <div className="flex flex-wrap gap-2">
          {COMPARISON_OPTIONS.map((c) =>
            c.key === compareKey ? (
              <OrangeButton key={c.key} onClick={() => setCompareKey(c.key)}>
                {c.label}
              </OrangeButton>
            ) : (
              <OrangeOutlineButton
                key={c.key}
                onClick={() => setCompareKey(c.key)}
              >
                {c.label}
              </OrangeOutlineButton>
            )
          )}
        </div>

        {/* sRPE Chart */}
        <div>
          <div className="text-xs font-semibold mb-2">sRPE（負荷）</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="md" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, srpeMax]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sRPE"
                stroke={BRAND.ORANGE}
                strokeWidth={2}
                dot={false}
              />
              {compareKey !== "none" && (
                <Line
                  type="monotone"
                  dataKey="sRPE_cmp"
                  stroke="#999"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fatigue Chart */}
        <div>
          <div className="text-xs font-semibold mb-2">疲労（主観）</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="md" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="fatigue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Chart */}
        <div>
          <div className="text-xs font-semibold mb-2">睡眠（主観）</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="md" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

