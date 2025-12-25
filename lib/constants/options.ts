// プロフィール選択肢（プロトタイプから移植）

export const TEAM_PROFILE_OPTIONS = {
  category: [
    "U12",
    "U13",
    "U14",
    "U15",
    "U16",
    "U17",
    "U18",
    "大学",
    "社会人",
  ],
  level: ["部活", "クラブ（地域）", "クラブ（強化）", "セミプロ相当"],
  weeklySessions: ["1", "2", "3", "4", "5", "6+"],
  matchFrequency: ["週0", "2週に1", "週1", "週2+"],
  activeDays: ["月", "火", "水", "木", "金", "土", "日"],
  policy: ["安全重視", "バランス", "強度重視"],
};

export const PLAYER_PROFILE_OPTIONS = {
  ageBand: ["小学生", "中学生", "高校生", "大学生", "社会人"],
  position: ["GK", "DF", "MF", "FW"],
  dominantFoot: ["右", "左", "両"],
  playingStatus: ["主力（長時間）", "交代中心", "出場少", "休養中"],
  currentInjuryStatus: [
    "問題なし",
    "痛みあり（プレー可）",
    "制限あり",
    "リハビリ中",
    "復帰直後（2週間以内）",
  ],
  pastInjuries: ["なし", "足首", "膝", "ハム", "股関節", "腰", "その他"],
};

