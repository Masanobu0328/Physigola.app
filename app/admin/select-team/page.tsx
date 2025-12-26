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
import { getUserTeams, createNewTeam } from "@/lib/actions/team";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { Plus } from "lucide-react";

export default function SelectTeamPage() {
  const router = useRouter();
  const isDemoMode = checkDemoMode();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);

    if (isDemoMode) {
      // デモモード: 複数チームを表示
      setTeams(getDemoTeams());
    } else {
      // 本番モード: ユーザーのチームを取得
      const userTeams = await getUserTeams();
      setTeams(userTeams);
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

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      alert("チーム名を入力してください");
      return;
    }

    if (isDemoMode) {
      alert("デモモードでは作成できません");
      return;
    }

    setCreating(true);
    const result = await createNewTeam(newTeamName);
    setCreating(false);

    if (result.success) {
      alert("チームを作成しました");
      setNewTeamName("");
      setShowNewTeamForm(false);
      loadTeams();
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

            <Separator />

            {/* New Team Button/Form */}
            {!showNewTeamForm ? (
              <button
                onClick={() => setShowNewTeamForm(true)}
                className="w-full text-left rounded-2xl border-2 border-dashed p-4 transition hover:border-orange-400 hover:bg-orange-50"
                style={{ borderColor: "rgba(223,150,26,0.3)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(223,150,26,0.1)" }}
                  >
                    <Plus className="h-6 w-6" style={{ color: BRAND.ORANGE }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: BRAND.ORANGE }}>
                      新しいチームを作成
                    </div>
                    <div className="text-xs text-muted-foreground">
                      複数のチームを管理できます
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">新しいチーム名</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="チーム名を入力"
                    disabled={creating}
                  />
                </div>
                <div className="flex gap-2">
                  <OrangeButton
                    onClick={handleCreateTeam}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? "作成中..." : "作成"}
                  </OrangeButton>
                  <button
                    onClick={() => {
                      setShowNewTeamForm(false);
                      setNewTeamName("");
                    }}
                    disabled={creating}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                </div>
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

