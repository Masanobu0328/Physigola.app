// ユニットテスト: バリデーション

import {
  isTeamProfileComplete,
  isPlayerProfileComplete,
  isValidRPE,
  isValidMinutes,
} from "@/lib/utils/validation";

describe("isTeamProfileComplete", () => {
  test("全項目が埋まっている => true", () => {
    const profile = {
      category: "U15",
      level: "クラブ（地域）",
      weeklySessions: "3",
      matchFrequency: "週1",
      activeDays: ["火", "木", "土"],
      policy: "バランス",
    };

    expect(isTeamProfileComplete(profile)).toBe(true);
  });

  test("activeDaysが空 => false", () => {
    const profile = {
      category: "U15",
      level: "クラブ（地域）",
      weeklySessions: "3",
      matchFrequency: "週1",
      activeDays: [],
      policy: "バランス",
    };

    expect(isTeamProfileComplete(profile)).toBe(false);
  });

  test("必須項目が欠けている => false", () => {
    const profile = {
      category: "",
      level: "クラブ（地域）",
      weeklySessions: "3",
      matchFrequency: "週1",
      activeDays: ["火"],
      policy: "バランス",
    };

    expect(isTeamProfileComplete(profile)).toBe(false);
  });
});

describe("isPlayerProfileComplete", () => {
  test("全項目が埋まっている => true", () => {
    const profile = {
      ageBand: "高校生",
      position: "MF",
      dominantFoot: "右",
      playingStatus: "交代中心",
      currentInjuryStatus: "問題なし",
      pastInjuries: ["なし"],
    };

    expect(isPlayerProfileComplete(profile)).toBe(true);
  });

  test("pastInjuriesが空 => false", () => {
    const profile = {
      ageBand: "高校生",
      position: "MF",
      dominantFoot: "右",
      playingStatus: "交代中心",
      currentInjuryStatus: "問題なし",
      pastInjuries: [],
    };

    expect(isPlayerProfileComplete(profile)).toBe(false);
  });
});

describe("isValidRPE", () => {
  test("0-10の範囲 => true", () => {
    expect(isValidRPE(0)).toBe(true);
    expect(isValidRPE(5)).toBe(true);
    expect(isValidRPE(10)).toBe(true);
  });

  test("範囲外 => false", () => {
    expect(isValidRPE(-1)).toBe(false);
    expect(isValidRPE(11)).toBe(false);
  });
});

describe("isValidMinutes", () => {
  test("0-1440の範囲 => true", () => {
    expect(isValidMinutes(0)).toBe(true);
    expect(isValidMinutes(90)).toBe(true);
    expect(isValidMinutes(1440)).toBe(true);
  });

  test("範囲外 => false", () => {
    expect(isValidMinutes(-1)).toBe(false);
    expect(isValidMinutes(1441)).toBe(false);
  });
});

