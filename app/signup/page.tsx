"use client";

// サインアップページ

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { OrangeButton } from "@/components/shared/OrangeButton";
import { signUp } from "@/lib/actions/auth";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !name) {
            setError("全ての項目を入力してください");
            return;
        }

        if (password.length < 6) {
            setError("パスワードは6文字以上で入力してください");
            return;
        }

        setLoading(true);
        const result = await signUp(email, password, name);
        setLoading(false);

        if (result.success) {
            alert("アカウントを作成しました！ログインページに移動します。");
            router.push("/login");
        } else {
            setError(result.error || "アカウント作成に失敗しました");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md rounded-2xl shadow-lg">
                <CardContent className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">アカウント作成</h1>
                        <p className="text-sm text-muted-foreground">
                            フィジゴラへようこそ
                        </p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">お名前</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="山田太郎"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="email@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="6文字以上"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <OrangeButton
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "作成中..." : "アカウント作成"}
                        </OrangeButton>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">既にアカウントをお持ちですか？ </span>
                        <Link href="/login" className="text-orange-600 hover:underline font-medium">
                            ログイン
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
