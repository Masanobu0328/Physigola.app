// ユニットテスト: computeStatus

import { computeStatus, STATUS } from "@/lib/logic/computeStatus";

describe("computeStatus", () => {
  test("高負荷 + 高疲労 + 悪い睡眠 = RED", () => {
    const result = computeStatus({
      rpe: 8,
      minutes: 100,
      fatigue: "高",
      sleep: "悪",
      movementFlag: true,
    });

    expect(result.key).toBe("RED");
  });

  test("中程度の値 = GREEN", () => {
    const result = computeStatus({
      rpe: 6,
      minutes: 70,
      fatigue: "中",
      sleep: "普通",
      movementFlag: false,
    });

    // 6*70=420 => +0, fatigue +1, sleep +1 => score 2 => GREEN
    expect(result.key).toBe("GREEN");
  });

  test("やや高い負荷 + 複数シグナル = YELLOW", () => {
    const result = computeStatus({
      rpe: 7,
      minutes: 80,
      fatigue: "中",
      sleep: "普通",
      movementFlag: true,
    });

    // 560 => +1, fatigue +1, sleep +1, flag +1 => 4 => YELLOW
    expect(result.key).toBe("YELLOW");
  });

  test("低負荷 + 良好な状態 = GREEN", () => {
    const result = computeStatus({
      rpe: 3,
      minutes: 60,
      fatigue: "低",
      sleep: "良",
      movementFlag: false,
    });

    expect(result.key).toBe("GREEN");
  });

  test("境界値: score = 5 => RED", () => {
    const result = computeStatus({
      rpe: 8,
      minutes: 90, // 720 => +2
      fatigue: "高", // +2
      sleep: "普通", // +1
      movementFlag: false,
    });

    // score = 2 + 2 + 1 = 5 => RED
    expect(result.key).toBe("RED");
  });

  test("境界値: score = 3 => YELLOW", () => {
    const result = computeStatus({
      rpe: 6,
      minutes: 80, // 480 => +1
      fatigue: "中", // +1
      sleep: "普通", // +1
      movementFlag: false,
    });

    // score = 1 + 1 + 1 = 3 => YELLOW
    expect(result.key).toBe("YELLOW");
  });
});

