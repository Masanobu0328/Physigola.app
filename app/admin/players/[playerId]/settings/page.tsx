"use client";

// 選手設定画面

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { ChoiceButtons } from "@/components/shared/ChoiceButtons";
import { FieldBlock } from "@/components/shared/FieldBlock";
import { PLAYER_PROFILE_OPTIONS } from "@/lib/constants/options";
import { normalizePastInjuries } from "@/lib/utils/injuries";
import {
  getPlayers,
  getPlayerProfile,
  savePlayerProfile,
} from "@/lib/actions/player";
import { 
  isDemoMode as checkDemoMode, 
  getDemoPlayers, 
  getDemoPlayerProfile 
} from "@/lib/demo/mockData";

export default function PlayerSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.playerId as string;
  const isDemoMode = checkDemoMode();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState({
    ageBand: "",
    position: "",
    dominantFoot: "",
    playingStatus: "",
    currentInjuryStatus: "",
    pastInjuries: ["なし"],
  });

  useEffect(() => {
    loadData();
  }, [playerId]);

  const loadData = async () => {
    setLoading(true);

    // Load player
    const playersData: any[] = isDemoMode ? getDemoPlayers() : await getPlayers();
    const foundPlayer = playersData.find((p) => p.id === playerId);
    
    if (!foundPlayer) {
      router.push("/admin");
      return;
    }
    
    setPlayer(foundPlayer);

    // Load player profile
    const profile: any = isDemoMode ? getDemoPlayerProfile(playerId) : await getPlayerProfile(playerId);
    if (profile) {
      setPlayerProfile({
        ageBand: profile.age_band,
        position: profile.position,
        dominantFoot: profile.dominant_foot,
        playingStatus: profile.playing_status,
        currentInjuryStatus: profile.current_injury_status,
        pastInjuries: profile.past_injuries,
      });
    } else {
      // Default
      setPlayerProfile({
        ageBand: "高校生",
        position: "MF",
        dominantFoot: "右",
        playingStatus: "交代中心",
        currentInjuryStatus: "問題なし",
        pastInjuries: ["なし"],
      });
    }

    setLoading(false);
  };

  const handleSavePlayer = async () => {
    if (isDemoMode) {
      alert("デモモードでは保存できません");
      return;
    }

    setSaving(true);
    const result = await savePlayerProfile(playerId, playerProfile);
    setSaving(false);

    if (result.success) {
      alert("選手設定を保存しました");
      router.push("/admin");
    } else {
      alert(`エラー: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:p-8 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  if (!player) {
    return null;
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
              <div className="text-xl font-semibold">
                選手設定（No.{player.jersey_number}）
              </div>
              <div className="text-sm text-muted-foreground">
                選手プロフィール管理
              </div>
            </div>

            <Separator />

            {/* Player Settings */}
            <div className="space-y-4">
              <FieldBlock title="年代" required>
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.ageBand}
                  value={playerProfile.ageBand}
                  onChange={(v) =>
                    setPlayerProfile({ ...playerProfile, ageBand: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="ポジション" required>
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.position}
                  value={playerProfile.position}
                  onChange={(v) =>
                    setPlayerProfile({ ...playerProfile, position: v })
                  }
                />
              </FieldBlock>

              <FieldBlock title="利き足" required>
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.dominantFoot}
                  value={playerProfile.dominantFoot}
                  onChange={(v) =>
                    setPlayerProfile({
                      ...playerProfile,
                      dominantFoot: v,
                    })
                  }
                />
              </FieldBlock>

              <FieldBlock title="起用歴" required>
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.playingStatus}
                  value={playerProfile.playingStatus}
                  onChange={(v) =>
                    setPlayerProfile({
                      ...playerProfile,
                      playingStatus: v,
                    })
                  }
                />
              </FieldBlock>

              <FieldBlock title="現在の状態" required>
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.currentInjuryStatus}
                  value={playerProfile.currentInjuryStatus}
                  onChange={(v) =>
                    setPlayerProfile({
                      ...playerProfile,
                      currentInjuryStatus: v,
                    })
                  }
                />
              </FieldBlock>

              <FieldBlock
                title="既往歴"
                required
                hint="複数選択可（「なし」は排他）"
              >
                <ChoiceButtons
                  options={PLAYER_PROFILE_OPTIONS.pastInjuries}
                  value={playerProfile.pastInjuries}
                  onChange={(v) =>
                    setPlayerProfile({
                      ...playerProfile,
                      pastInjuries: normalizePastInjuries(v),
                    })
                  }
                  multi
                />
              </FieldBlock>

              <OrangeButton
                className="w-full"
                onClick={handleSavePlayer}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存"}
              </OrangeButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

