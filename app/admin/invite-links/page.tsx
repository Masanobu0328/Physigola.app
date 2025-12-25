"use client";

// 選手入力URL管理画面

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Copy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrangeButton, OrangeOutlineButton } from "@/components/shared/OrangeButton";
import {
  getInviteLinks,
  createInviteLink,
  deactivateInviteLink,
} from "@/lib/actions/invite";
import { 
  isDemoMode as checkDemoMode, 
  getDemoInviteLinks 
} from "@/lib/demo/mockData";

export default function InviteLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const isDemoMode = checkDemoMode();

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    const data = isDemoMode ? getDemoInviteLinks() : await getInviteLinks();
    setLinks(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (isDemoMode) {
      alert("デモモードでは作成できません");
      return;
    }

    setCreating(true);
    const result = await createInviteLink();
    setCreating(false);

    if (result.success) {
      await loadLinks();
    } else {
      alert(`エラー: ${result.error}`);
    }
  };

  const handleDeactivate = async (linkId: string) => {
    if (isDemoMode) {
      alert("デモモードでは無効化できません");
      return;
    }

    if (!confirm("このリンクを無効化しますか？")) return;

    const result = await deactivateInviteLink(linkId);

    if (result.success) {
      await loadLinks();
    } else {
      alert(`エラー: ${result.error}`);
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
    alert("URLをコピーしました");
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
              <div className="text-xl font-semibold">選手入力URL</div>
              <div className="text-sm text-muted-foreground">
                選手がスマホから直接入力するためのURL管理
              </div>
            </div>

            <Separator />

            {/* Create Button */}
            <OrangeButton
              className="w-full"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "作成中..." : "新しいURLを発行"}
            </OrangeButton>

            {/* Links List */}
            <div className="space-y-2">
              {links.map((link) => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${link.token}`;
                const isExpired =
                  link.expires_at && new Date(link.expires_at) < new Date();

                return (
                  <div
                    key={link.id}
                    className="rounded-2xl border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {link.is_active && !isExpired ? (
                          <Badge className="bg-emerald-100 text-emerald-900">
                            有効
                          </Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        作成: {new Date(link.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <Input
                      className="rounded-2xl text-xs"
                      value={url}
                      readOnly
                    />

                    <div className="flex gap-2">
                      <OrangeOutlineButton
                        size="sm"
                        onClick={() => handleCopy(link.token)}
                      >
                        <Copy className="h-4 w-4 mr-2" /> コピー
                      </OrangeOutlineButton>

                      {link.is_active && !isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => handleDeactivate(link.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> 無効化
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {links.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  URLが発行されていません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

