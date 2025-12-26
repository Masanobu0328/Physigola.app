"use client";

// 設定画面（チーム・選手プロフィール）

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { ChoiceButtons } from "@/components/shared/ChoiceButtons";
import { FieldBlock } from "@/components/shared/FieldBlock";
import {
  TEAM_PROFILE_OPTIONS,
} from "@/lib/constants/options";
import { getTeam, getTeamProfile, saveTeamProfile, updateTeamName } from "@/lib/actions/team";
import {
  isDemoMode as checkDemoMode,
  getDemoTeamProfile,
} from "@/lib/demo/mockData";

export default function SettingsPage() {
  const router = useRouter();
  const isDemoMode = checkDemoMode();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Team name
  const [teamName, setTeamName] = useState("");

  // Team
  const [teamProfile, setTeamProfile] = useState({
    category: "",
    level: "",
    weeklySessions: "",
    matchFrequency: "",
    activeDays: [] as string[],
    policy: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load team info
    const teamInfo: any = isDemoMode ? { name: "デモチーム" } : await getTeam();
    if (teamInfo) {
      setTeamName(teamInfo.name || "");
    }

    // Load team profile
    const teamData: any = isDemoMode ? getDemoTeamProfile() : await getTeamProfile();
    if (teamData) {
      setTeamProfile({
        category: teamData.category,
        level: teamData.level,
        weeklySessions: teamData.weekly_sessions,
        matchFrequency: teamData.match_frequency,
        activeDays: teamData.active_days,
        policy: teamData.policy,
      });
    }

    setLoading(false);
  };

  const handleSaveAll = async () => {
    if (isDemoMode) {
      alert("デモモードでは保存できません");
      return;
    }

    // バリデーション
    if (!teamName.trim()) {
      alert("チーム名を入力してください");
      return;
    }

    if (!teamProfile.category || !teamProfile.level || !teamProfile.weeklySessions ||
      !teamProfile.matchFrequency || teamProfile.activeDays.length === 0 || !teamProfile.policy) {
      alert("全ての項目を入力してください");
      return;
    }

    setSaving(true);

    // 1. チーム名を保存
    const nameResult = await updateTeamName(teamName);
    if (!nameResult.success) {
      setSaving(false);
      alert(`チーム名の保存に失敗しました: ${nameResult.error}`);
      return;
    }

    // 2. チーム設定を保存
    const profileResult = await saveTeamProfile(teamProfile);
    setSaving(false);

    if (profileResult.success) {
      alert("チーム設定を保存しました");
    } else {
      alert(`チーム設定の保存に失敗しました: ${profileResult.error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

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
              </div>
              <Badge className="rounded-full" variant="secondary">
                MVP
              </Badge>
            </div>

            {/* Title */}
            <div>
              <div className="text-xl font-semibold">チーム設定</div>
              <div className="text-sm text-muted-foreground">
                チームプロフィール管理
              </div>
            </div>

            <Separator />

            {/* Team Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">チーム名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="チーム名を入力"
              />
            </div>

            <Separator />

            {/* Team Settings */}
            <div className="space-y-4">
              <FieldBlock title="カテゴリ" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.category}
                  value={teamProfile.category}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, category: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="レベル" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.level}
                  value={teamProfile.level}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, level: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="週の活動回数" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.weeklySessions}
                  value={teamProfile.weeklySessions}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, weeklySessions: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="試合頻度" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.matchFrequency}
                  value={teamProfile.matchFrequency}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, matchFrequency: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="活動曜日" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.activeDays}
                  value={teamProfile.activeDays}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, activeDays: v })
                  }
                  multi
                />
              </FieldBlock>

              <FieldBlock title="方針" required>
                <ChoiceButtons
                  options={TEAM_PROFILE_OPTIONS.policy}
                  value={teamProfile.policy}
                  onChange={(v) =>
                    setTeamProfile({ ...teamProfile, policy: v })
                  }
                />
              </FieldBlock>

              <OrangeButton
                className="w-full"
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? "保存中..." : "すべて保存"}
              </OrangeButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

