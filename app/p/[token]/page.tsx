"use client";

// Player入力画面 - 背番号選択

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { BRAND } from "@/lib/constants/theme";
import { validateToken, getPlayersByToken } from "@/lib/actions/invite";
import { 
  isDemoMode as checkDemoMode, 
  DEMO_TEAM,
  getDemoPlayers 
} from "@/lib/demo/mockData";

export default function PlayerSelectPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const isDemoMode = checkDemoMode();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      // デモモード
      setTeamName(DEMO_TEAM.name);
      setPlayers(getDemoPlayers());
      setLoading(false);
      return;
    }

    // Validate token
    const validation: any = await validateToken(token);

    if (!validation.success || !validation.data) {
      setError(validation.error || "無効なURLです");
      setLoading(false);
      return;
    }

    setTeamName(validation.data.teams?.name || "チーム");

    // Load players
    const playersData: any[] = await getPlayersByToken(token);
    setPlayers(playersData || []);

    setLoading(false);
  };

  const handleSelectPlayer = (playerId: string) => {
    router.push(`/p/${token}/${playerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
        <Card className="rounded-2xl shadow-sm border max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-xl font-semibold text-rose-600">
                エラー
              </div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-4 md:p-8">
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Team</div>
                <div
                  className="text-base font-semibold"
                  style={{ color: BRAND.ORANGE }}
                >
                  {teamName}
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                選手入力
              </Badge>
            </div>

            {/* Title */}
            <div>
              <div className="text-xl font-semibold">背番号を選択</div>
              <div className="text-sm text-muted-foreground">
                あなたの背番号をタップしてください
              </div>
            </div>

            <Separator />

            {/* Player Grid */}
            <div className="grid grid-cols-3 gap-2">
              {(players || []).map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player.id)}
                  className="rounded-2xl border p-4 text-center transition hover:shadow-sm hover:border-orange-300"
                >
                  <div className="text-xs text-muted-foreground">背番号</div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {player.jersey_number}
                  </div>
                </button>
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                選手が登録されていません
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground text-center">
          Physiogora Judgment OS - 選手入力
        </div>
      </div>
    </div>
  );
}

