// 個別選手詳細画面

import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlayerChart } from "@/components/admin/PlayerChart";
import { BRAND } from "@/lib/constants/theme";
import { getCurrentUser } from "@/lib/actions/auth";
import { getPlayers, getPlayerProfile } from "@/lib/actions/player";
import { getPlayerConditions } from "@/lib/actions/condition";
import { getTeamProfile } from "@/lib/actions/team";
import { isPlayerProfileComplete } from "@/lib/utils/validation";
import type { TeamProfile, PlayerProfile } from "@/lib/logic/buildReview";
import { 
  isDemoMode as checkDemoMode, 
  DEMO_ADMIN_USER,
  getDemoPlayers, 
  getDemoTeamProfile,
  getDemoPlayerProfile,
  getDemoPlayerConditions 
} from "@/lib/demo/mockData";
import { PlayerDetailContent } from "./PlayerDetailContent";

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { playerId } = await params;
  const isDemoMode = checkDemoMode();
  
  const user = isDemoMode ? DEMO_ADMIN_USER : await getCurrentUser();
  if (!user && !isDemoMode) redirect("/login");

  // デモモードでは、ユーザーオブジェクトからチームIDを取得
  const teamId = isDemoMode ? (user as any)?.team_id : undefined;

  const players: any[] = isDemoMode ? getDemoPlayers(teamId) : await getPlayers();
  const player = players.find((p: any) => p.id === playerId);

  if (!player) {
    redirect("/admin");
  }

  // 全期間のデータを取得（Client Componentでフィルタリング）
  const allConditions: any[] = isDemoMode 
    ? getDemoPlayerConditions(playerId, 365)
    : await getPlayerConditions(playerId, 365);

  const playerProfileData: any = isDemoMode 
    ? getDemoPlayerProfile(playerId)
    : await getPlayerProfile(playerId);
  const teamProfileData: any = isDemoMode 
    ? getDemoTeamProfile(teamId)
    : await getTeamProfile();

  const teamProfile: TeamProfile | undefined = teamProfileData
    ? {
        category: teamProfileData.category,
        level: teamProfileData.level,
        weeklySessions: teamProfileData.weekly_sessions,
        matchFrequency: teamProfileData.match_frequency,
        activeDays: teamProfileData.active_days,
        policy: teamProfileData.policy,
      }
    : undefined;

  const playerProfile: PlayerProfile | undefined = playerProfileData
    ? {
        ageBand: playerProfileData.age_band,
        position: playerProfileData.position,
        dominantFoot: playerProfileData.dominant_foot,
        playingStatus: playerProfileData.playing_status,
        currentInjuryStatus: playerProfileData.current_injury_status,
        pastInjuries: playerProfileData.past_injuries,
      }
    : undefined;

  const profileComplete = isPlayerProfileComplete(playerProfile);

  return (
    <PlayerDetailContent
      player={player}
      user={user}
      allConditions={allConditions}
      teamProfile={teamProfile}
      playerProfile={playerProfile}
      profileComplete={profileComplete}
      isDemoMode={isDemoMode}
    />
  );
}
