// 既往歴正規化ユーティリティ
// プロトタイプから忠実に移植

/**
 * 既往歴の正規化
 * 「なし」は排他的：「なし」+他の選択肢が同時に選ばれた場合、「なし」を削除
 * 空配列の場合は「なし」を返す
 */
export function normalizePastInjuries(injuries: string[]): string[] {
  const set = new Set(injuries);

  // 「なし」が選ばれていて、他の選択肢もある場合は「なし」を削除
  if (set.has("なし") && set.size > 1) {
    set.delete("なし");
  }

  const arr = Array.from(set);

  // 空の場合は「なし」を返す
  return arr.length ? arr : ["なし"];
}

/**
 * 既往歴が有効かチェック（最低1つ必須）
 */
export function isValidPastInjuries(injuries: string[]): boolean {
  return Array.isArray(injuries) && injuries.length > 0;
}

