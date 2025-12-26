"use client";

// Admin ホーム画面（選手一覧）

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Link as LinkIcon } from "lucide-react";
import { OrangeButton, OrangeOutlineButton } from "@/components/shared/OrangeButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BRAND } from "@/lib/constants/theme";
import { computeStatus, STATUS } from "@/lib/logic/computeStatus";
import { isTeamProfileComplete, isPlayerProfileComplete } from "@/lib/utils/validation";
import type { TeamProfile, PlayerProfile } from "@/lib/logic/buildReview";
import {
  isDemoMode as checkDemoMode,
  DEMO_ADMIN_USER,
  getDemoPlayers,
  getDemoTeamProfile,
  getDemoPlayerConditions,
  getDemoTeams
} from "@/lib/demo/mockData";

export default function AdminHomePage() {
  const router = useRouter();
  const isDemoMode = checkDemoMode();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [playerStatuses, setPlayerStatuses] = useState<any[]>([]);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // デモモード: localStorageからチームIDを取得
    let teamId: string | null = null;
    if (isDemoMode) {
      if (typeof window !== 'undefined') {
        teamId = localStorage.getItem('selectedTeamId');
      }

      // チームが選択されていない場合はチーム選択画面へ
      if (!teamId) {
        router.push('/admin/select-team');
        return;
      }

      setSelectedTeamId(teamId);

      // 選択されたチームの情報を取得
      const teams = getDemoTeams();
      const selectedTeam = teams.find(t => t.id === teamId);

      const demoUser = {
        ...DEMO_ADMIN_USER,
        team_id: teamId,
        teams: selectedTeam,
      };
      setUser(demoUser);

      // プレイヤーデータを取得
      const playersData = getDemoPlayers(teamId);
      setPlayers(playersData);

      // チームプロフィールを取得
      const teamProfileData = getDemoTeamProfile(teamId);
      if (teamProfileData) {
        setTeamProfile({
          category: teamProfileData.category,
          level: teamProfileData.level,
          weeklySessions: teamProfileData.weekly_sessions,
          matchFrequency: teamProfileData.match_frequency,
          activeDays: teamProfileData.active_days,
          policy: teamProfileData.policy,
        });
      }

      // 各選手の最新ステータスを計算
      const statuses = playersData.map((player: any) => {
        // 全期間のデータを取得して、最新の1件を取得
        // デモモードでは古い順にソートされているので、最新は最後の要素
        const allConditions = getDemoPlayerConditions(player.id);
        const latestCondition = allConditions.length > 0 ? allConditions[allConditions.length - 1] : null;

        if (!latestCondition) {
          return {
            player,
            status: STATUS.GREEN,
            hasProfile: !!player.player_profiles,
          };
        }

        const status = computeStatus({
          rpe: latestCondition.rpe,
          minutes: latestCondition.minutes,
          fatigue: latestCondition.fatigue,
          sleep: latestCondition.sleep,
        });

        return {
          player,
          status,
          hasProfile: !!player.player_profiles,
        };
      });
      setPlayerStatuses(statuses);
    } else {
      // 本番モード: localStorageからチームIDを取得
      if (typeof window !== 'undefined') {
        teamId = localStorage.getItem('selectedTeamId');
      }

      // チームが選択されていない場合はチーム選択画面へ
      if (!teamId) {
        router.push('/admin/select-team');
        return;
      }

      setSelectedTeamId(teamId);

      // ユーザー情報を取得（動的インポート）
      const { getCurrentUser } = await import("@/lib/actions/auth");
      const { getTeamProfile } = await import("@/lib/actions/team");
      const { getPlayers } = await import("@/lib/actions/player");

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // チームプロフィールを取得
      const teamProfileData = await getTeamProfile();
      if (teamProfileData) {
        setTeamProfile({
          category: teamProfileData.category,
          level: teamProfileData.level,
          weeklySessions: teamProfileData.weekly_sessions,
          matchFrequency: teamProfileData.match_frequency,
          activeDays: teamProfileData.active_days,
          policy: teamProfileData.policy,
        });
      }

      // プレイヤーデータを取得
      const playersData = await getPlayers();
      setPlayers(playersData || []);

      // 各選手のステータスを計算（簡易版）
      const statuses = (playersData || []).map((player: any) => ({
        player,
        status: STATUS.GREEN,
        hasProfile: !!player.player_profiles,
      }));
      setPlayerStatuses(statuses);
    }

    setLoading(false);
  };

  const handleChangeTeam = () => {
    router.push('/admin/select-team');
  };

  const handleLogout = () => {
    if (isDemoMode) {
      // デモモード: localStorageをクリアしてログイン画面へ
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedTeamId');
      }
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  const isTeamComplete = isTeamProfileComplete(teamProfile);

  return (
    <div className="min-h-screen w-full bg-white p-4 md:p-8">
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* デモモードバナー */}
            {isDemoMode && (
              <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔧</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-900">
                      デモモード（開発用）
                    </div>
                    <div className="text-xs text-amber-700">
                      Supabase未設定のため、実際のデータは表示されません。本番運用時は環境変数を設定してください。
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3">
              <button onClick={handleChangeTeam} className="flex items-center gap-2 hover:opacity-70 transition">
                <div className="leading-tight">
                  <div className="text-sm text-muted-foreground">Team</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {user?.teams?.name || "チーム"} ▼
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full" variant="secondary">
                  MVP
                </Badge>
                <Link href="/admin/settings">
                  <OrangeOutlineButton size="sm">
                    <Settings className="h-4 w-4 mr-2" /> 設定
                  </OrangeOutlineButton>
                </Link>
                {isDemoMode ? (
                  <button onClick={handleLogout}>
                    <OrangeOutlineButton size="sm">
                      <LogOut className="h-4 w-4 mr-2" /> ログアウト
                    </OrangeOutlineButton>
                  </button>
                ) : (
                  <OrangeOutlineButton size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> ログアウト
                  </OrangeOutlineButton>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">ホーム</div>
                <div className="text-sm text-muted-foreground">
                  {isTeamComplete
                    ? "選手一覧（背番号 × ステータス）"
                    : "設定：チーム情報（必須）を入力してください"}
                </div>
              </div>
            </div>

            <Separator />

            {/* Team Profile Warning */}
            {!isTeamComplete && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "rgba(223,150,26,0.35)",
                  background: "rgba(223,150,26,0.06)",
                }}
              >
                <div className="text-sm font-semibold" style={{ color: BRAND.ORANGE }}>
                  チーム情報（必須）が未設定です
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  設定から「カテゴリ/レベル/活動頻度/試合頻度/曜日/方針」を入力してください。
                </div>
                <div className="mt-3">
                  <Link href="/admin/settings">
                    <OrangeButton>
                      <Settings className="h-4 w-4 mr-2" /> 設定へ
                    </OrangeButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Status Legend */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={STATUS.GREEN} />
              <StatusBadge status={STATUS.YELLOW} />
              <StatusBadge status={STATUS.RED} />
            </div>

            {/* Player List */}
            <div className="grid gap-2">
              {playerStatuses.map(({ player, status, hasProfile }) => {
                const subtitle =
                  status.key === "RED"
                    ? "負荷注意"
                    : status.key === "YELLOW"
                      ? "疲労↑"
                      : "問題なし";

                const profileComplete = hasProfile && player.player_profiles
                  ? isPlayerProfileComplete({
                    ageBand: player.player_profiles.age_band,
                    position: player.player_profiles.position,
                    dominantFoot: player.player_profiles.dominant_foot,
                    playingStatus: player.player_profiles.playing_status,
                    currentInjuryStatus: player.player_profiles.current_injury_status,
                    pastInjuries: player.player_profiles.past_injuries,
                  })
                  : false;

                return (
                  <div
                    key={player.id}
                    className={`w-full rounded-2xl border p-3 ${status.tone}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-base font-semibold flex items-center gap-2">
                            No.{player.jersey_number}
                            {!profileComplete && (
                              <Badge className="rounded-full" variant="secondary">
                                プロフィール未設定
                              </Badge>
                            )}
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {subtitle}
                        </div>
                      </Link>
                      <Link href={`/admin/players/${player.id}/settings`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl shrink-0"
                          aria-label="設定"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="grid gap-2">
              <Link href="/admin/invite-links">
                <OrangeOutlineButton className="w-full">
                  <LinkIcon className="h-4 w-4 mr-2" /> 選手入力URL（共有用）
                </OrangeOutlineButton>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground text-center">
          Physiogora Judgment OS - MVP
        </div>
      </div>
    </div>
  );
}
