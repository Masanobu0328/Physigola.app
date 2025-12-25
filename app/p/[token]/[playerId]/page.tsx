"use client";

// Player入力画面 - コンディション入力

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton, OrangeOutlineButton } from "@/components/shared/OrangeButton";
import { BRAND } from "@/lib/constants/theme";
import { validateToken, getPlayersByToken } from "@/lib/actions/invite";
import { saveConditionAsPlayer } from "@/lib/actions/condition";
import { yyyyMmDd } from "@/lib/logic/periodFilter";
import { 
  isDemoMode as checkDemoMode, 
  DEMO_TEAM,
  getDemoPlayers 
} from "@/lib/demo/mockData";

export default function PlayerInputPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const playerId = params.playerId as string;
  const isDemoMode = checkDemoMode();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState(0);

  const [step, setStep] = useState<"srpe" | "condition">("srpe");
  const [rpe, setRpe] = useState<number>(7);
  const [minutes, setMinutes] = useState<number>(90);
  const [fatigue, setFatigue] = useState<"低" | "中" | "高">("中");
  const [sleep, setSleep] = useState<"良" | "普通" | "悪">("普通");
  const [pain, setPain] = useState<"なし" | "あり">("なし");

  useEffect(() => {
    loadData();
  }, [token, playerId]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      // デモモード
      setTeamName(DEMO_TEAM.name);
      const players = getDemoPlayers();
      const player = players.find((p: any) => p.id === playerId);
      
      if (!player) {
        setError("選手が見つかりません");
        setLoading(false);
        return;
      }

      setJerseyNumber(player.jersey_number);
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

    // Load players to get jersey number
    const playersData: any[] = await getPlayersByToken(token);
    const player = playersData.find((p: any) => p.id === playerId);

    if (!player) {
      setError("選手が見つかりません");
      setLoading(false);
      return;
    }

    setJerseyNumber(player.jersey_number);
    setLoading(false);
  };

  const handleSave = async () => {
    if (isDemoMode) {
      alert("デモモードでは保存できません");
      return;
    }

    setSaving(true);

    const result = await saveConditionAsPlayer(token, playerId, {
      date: yyyyMmDd(new Date()),
      rpe,
      minutes,
      fatigue,
      sleep,
      pain,
    });

    setSaving(false);

    if (result.success) {
      alert("入力が完了しました！");
      router.push(`/p/${token}`);
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/p/${token}`)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl"
                    aria-label="戻る"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </button>
                <div className="leading-tight">
                  <div className="text-sm text-muted-foreground">Team</div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {teamName}
                  </div>
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                30秒
              </Badge>
            </div>

            {/* Title */}
            <div>
              <div className="text-xl font-semibold">
                今日の入力（No.{jerseyNumber}）
              </div>
              <div className="text-sm text-muted-foreground">
                2ステップで完了
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={step} onValueChange={(v) => setStep(v as any)}>
              <TabsList className="grid grid-cols-2 rounded-2xl">
                <TabsTrigger
                  value="srpe"
                  className="rounded-2xl"
                  style={
                    step === "srpe"
                      ? { background: BRAND.ORANGE, color: "#fff" }
                      : { color: "#111" }
                  }
                >
                  sRPE
                </TabsTrigger>
                <TabsTrigger
                  value="condition"
                  className="rounded-2xl"
                  style={
                    step === "condition"
                      ? { background: BRAND.ORANGE, color: "#fff" }
                      : { color: "#111" }
                  }
                >
                  主観
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Step 1: sRPE */}
            {step === "srpe" && (
              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    borderColor: "rgba(223,150,26,0.25)",
                    background: "rgba(223,150,26,0.06)",
                  }}
                >
                  <div className="text-xs text-muted-foreground">
                    計算されるsRPE
                  </div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: BRAND.ORANGE }}
                  >
                    {rpe * minutes}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>RPE（0–10）</Label>
                  <div className="text-xs text-muted-foreground mb-2">
                    きつさ（0=とても楽 〜 10=最大努力）
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={rpe}
                    onChange={(e) => setRpe(Number(e.target.value))}
                    className="rounded-2xl text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>時間（分）</Label>
                  <div className="text-xs text-muted-foreground mb-2">
                    練習・試合の合計時間
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={5}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="rounded-2xl text-lg"
                  />
                </div>

                <OrangeButton
                  className="w-full"
                  onClick={() => setStep("condition")}
                >
                  次へ
                </OrangeButton>
              </div>
            )}

            {/* Step 2: Condition */}
            {step === "condition" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>疲労</Label>
                  <div className="flex gap-2">
                    {(["低", "中", "高"] as const).map((v) =>
                      fatigue === v ? (
                        <OrangeButton
                          key={v}
                          onClick={() => setFatigue(v)}
                          type="button"
                        >
                          {v}
                        </OrangeButton>
                      ) : (
                        <OrangeOutlineButton
                          key={v}
                          onClick={() => setFatigue(v)}
                          type="button"
                        >
                          {v}
                        </OrangeOutlineButton>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>睡眠</Label>
                  <div className="flex gap-2">
                    {(["良", "普通", "悪"] as const).map((v) =>
                      sleep === v ? (
                        <OrangeButton
                          key={v}
                          onClick={() => setSleep(v)}
                          type="button"
                        >
                          {v}
                        </OrangeButton>
                      ) : (
                        <OrangeOutlineButton
                          key={v}
                          onClick={() => setSleep(v)}
                          type="button"
                        >
                          {v}
                        </OrangeOutlineButton>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>痛み</Label>
                  <div className="flex gap-2">
                    {(["なし", "あり"] as const).map((v) =>
                      pain === v ? (
                        <OrangeButton
                          key={v}
                          onClick={() => setPain(v)}
                          type="button"
                        >
                          {v}
                        </OrangeButton>
                      ) : (
                        <OrangeOutlineButton
                          key={v}
                          onClick={() => setPain(v)}
                          type="button"
                        >
                          {v}
                        </OrangeOutlineButton>
                      )
                    )}
                  </div>
                </div>

                <OrangeButton
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "保存中..." : "完了"}
                </OrangeButton>
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

