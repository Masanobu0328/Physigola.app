// トークン生成・検証ユーティリティ

import { randomBytes } from "crypto";

/**
 * ランダムなトークンを生成
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * トークンの形式チェック（基本的な検証）
 */
export function isValidTokenFormat(token: string): boolean {
  // 64文字の16進数文字列
  return /^[a-f0-9]{64}$/.test(token);
}

