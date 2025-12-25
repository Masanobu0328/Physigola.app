"use client";

// チーム選択画面

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { BRAND } from "@/lib/constants/theme";
import { isDemoMode as checkDemoMode, getDemoTeams } from "@/lib/demo/mockData";

export default function SelectTeamPage() {
  const router = useRouter();
  const isDemoMode = checkDemoMode();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);

    if (isDemoMode) {
      // デモモード: 複数チームを表示
      setTeams(getDemoTeams());
    } else {
      // 本番モード: ユーザーのチームを取得（将来的に実装）
      setTeams([]);
    }

    setLoading(false);
  };

  const handleSelectTeam = (teamId: string) => {
    // チームIDをlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTeamId', teamId);
    }
    router.push('/admin');
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
            {/* Title */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">チーム選択</div>
                <div className="text-sm text-muted-foreground">
                  管理するチームを選択してください
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                MVP
              </Badge>
            </div>

            <Separator />

            {/* Team List */}
            <div className="grid gap-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="w-full text-left rounded-2xl border p-4 transition hover:shadow-md hover:border-orange-300"
                  style={{
                    borderColor: "rgba(223,150,26,0.25)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(223,150,26,0.1)",
                      }}
                    >
                      <Users className="h-6 w-6" style={{ color: BRAND.ORANGE }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-lg font-semibold"
                        style={{ color: BRAND.ORANGE }}
                      >
                        {team.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        チームID: {team.id}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {teams.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                チームが見つかりません
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground text-center">
          Physiogora Judgment OS - チーム選択
        </div>
      </div>
    </div>
  );
}

