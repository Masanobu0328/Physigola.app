// ユニットテスト: 既往歴正規化

import { normalizePastInjuries, isValidPastInjuries } from "@/lib/utils/injuries";

describe("normalizePastInjuries", () => {
  test("「なし」+ 他の選択肢 => 「なし」を削除", () => {
    const result = normalizePastInjuries(["なし", "膝"]);
    expect(result).toContain("膝");
    expect(result).not.toContain("なし");
  });

  test("「なし」のみ => そのまま", () => {
    const result = normalizePastInjuries(["なし"]);
    expect(result).toEqual(["なし"]);
  });

  test("空配列 => 「なし」を返す", () => {
    const result = normalizePastInjuries([]);
    expect(result).toEqual(["なし"]);
  });

  test("複数の既往歴 => そのまま", () => {
    const result = normalizePastInjuries(["膝", "足首", "ハム"]);
    expect(result).toContain("膝");
    expect(result).toContain("足首");
    expect(result).toContain("ハム");
    expect(result.length).toBe(3);
  });

  test("重複を排除", () => {
    const result = normalizePastInjuries(["膝", "膝", "足首"]);
    expect(result.filter((x) => x === "膝").length).toBe(1);
  });
});

describe("isValidPastInjuries", () => {
  test("配列で最低1つ => valid", () => {
    expect(isValidPastInjuries(["なし"])).toBe(true);
    expect(isValidPastInjuries(["膝"])).toBe(true);
  });

  test("空配列 => invalid", () => {
    expect(isValidPastInjuries([])).toBe(false);
  });

  test("配列でない => invalid", () => {
    expect(isValidPastInjuries(null as any)).toBe(false);
    expect(isValidPastInjuries(undefined as any)).toBe(false);
  });
});

