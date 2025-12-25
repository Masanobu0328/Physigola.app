// デモモード用のモックデータ

import { yyyyMmDd, parseYmd } from "@/lib/logic/periodFilter";

// 複数のチーム
export const DEMO_TEAMS = [
  {
    id: 'demo-team-1',
    name: '横浜ユースFC',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-team-2',
    name: '東京サッカークラブ',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-team-3',
    name: '大阪高校サッカー部',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const DEMO_TEAM = DEMO_TEAMS[0];

export const DEMO_ADMIN_USER = {
  id: 'demo-user-id',
  team_id: 'demo-team-1',
  email: 'demo@example.com',
  role: 'admin' as const,
  teams: DEMO_TEAM,
};

// 各チームのプロフィール
export const DEMO_TEAM_PROFILES: Record<string, any> = {
  'demo-team-1': {
    team_id: 'demo-team-1',
    category: 'ユース',
    level: '県トップ',
    weekly_sessions: '週4-5回',
    match_frequency: '週1回',
    active_days: ['月', '火', '水', '木', '土'],
    policy: 'バランス重視',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  'demo-team-2': {
    team_id: 'demo-team-2',
    category: 'U15',
    level: 'クラブ（強化）',
    weekly_sessions: '週5回',
    match_frequency: '週2+回',
    active_days: ['月', '火', '水', '木', '金', '土'],
    policy: '強度重視',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  'demo-team-3': {
    team_id: 'demo-team-3',
    category: 'U18',
    level: '部活',
    weekly_sessions: '週3回',
    match_frequency: '週1回',
    active_days: ['火', '木', '土'],
    policy: '安全重視',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

export const DEMO_TEAM_PROFILE = DEMO_TEAM_PROFILES['demo-team-1'];

// 各チームの選手データ
const TEAM_1_PLAYERS = [
  {
    id: 'team1-player-1',
    team_id: 'demo-team-1',
    jersey_number: 7,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team1-player-1',
      age_band: '高校生',
      position: 'FW',
      dominant_foot: '右',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team1-player-2',
    team_id: 'demo-team-1',
    jersey_number: 10,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team1-player-2',
      age_band: '高校生',
      position: 'MF',
      dominant_foot: '左',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['膝の怪我'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team1-player-3',
    team_id: 'demo-team-1',
    jersey_number: 4,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team1-player-3',
      age_band: '高校生',
      position: 'DF',
      dominant_foot: '右',
      playing_status: '交代中心',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team1-player-4',
    team_id: 'demo-team-1',
    jersey_number: 1,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team1-player-4',
      age_band: '高校生',
      position: 'GK',
      dominant_foot: '右',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team1-player-5',
    team_id: 'demo-team-1',
    jersey_number: 23,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team1-player-5',
      age_band: '高校生',
      position: 'FW',
      dominant_foot: '右',
      playing_status: '出場少',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

const TEAM_2_PLAYERS = [
  {
    id: 'team2-player-1',
    team_id: 'demo-team-2',
    jersey_number: 9,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team2-player-1',
      age_band: '中学生',
      position: 'FW',
      dominant_foot: '右',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team2-player-2',
    team_id: 'demo-team-2',
    jersey_number: 11,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team2-player-2',
      age_band: '中学生',
      position: 'MF',
      dominant_foot: '右',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team2-player-3',
    team_id: 'demo-team-2',
    jersey_number: 5,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team2-player-3',
      age_band: '中学生',
      position: 'DF',
      dominant_foot: '右',
      playing_status: '交代中心',
      current_injury_status: '問題なし',
      past_injuries: ['足首の捻挫'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

const TEAM_3_PLAYERS = [
  {
    id: 'team3-player-1',
    team_id: 'demo-team-3',
    jersey_number: 3,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team3-player-1',
      age_band: '高校生',
      position: 'DF',
      dominant_foot: '右',
      playing_status: '交代中心',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'team3-player-2',
    team_id: 'demo-team-3',
    jersey_number: 8,
    created_at: '2024-01-01T00:00:00Z',
    player_profiles: {
      player_id: 'team3-player-2',
      age_band: '高校生',
      position: 'MF',
      dominant_foot: '左',
      playing_status: '主力（長時間）',
      current_injury_status: '問題なし',
      past_injuries: ['なし'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

export const DEMO_PLAYERS_BY_TEAM: Record<string, any[]> = {
  'demo-team-1': TEAM_1_PLAYERS,
  'demo-team-2': TEAM_2_PLAYERS,
  'demo-team-3': TEAM_3_PLAYERS,
};

export const DEMO_PLAYERS = TEAM_1_PLAYERS;

// 各選手のコンディションデータ（1週間分）
export const DEMO_CONDITIONS: Record<string, any[]> = {
  'team1-player-1': [
    {
      id: 'cond-1-1',
      player_id: 'team1-player-1',
      date: '2024-12-18',
      rpe: 8,
      minutes: 90,
      fatigue: '高',
      sleep: '悪',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-1-2',
      player_id: 'team1-player-1',
      date: '2024-12-17',
      rpe: 6,
      minutes: 75,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-1-3',
      player_id: 'team1-player-1',
      date: '2024-12-16',
      rpe: 4,
      minutes: 60,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-1-4',
      player_id: 'team1-player-1',
      date: '2024-12-15',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-1-5',
      player_id: 'team1-player-1',
      date: '2024-12-14',
      rpe: 8,
      minutes: 85,
      fatigue: '高',
      sleep: '悪',
      pain: 'あり',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-1-6',
      player_id: 'team1-player-1',
      date: '2024-12-13',
      rpe: 6,
      minutes: 70,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-1-7',
      player_id: 'team1-player-1',
      date: '2024-12-12',
      rpe: 4,
      minutes: 45,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team1-player-2': [
    {
      id: 'cond-2-1',
      player_id: 'team1-player-2',
      date: '2024-12-18',
      rpe: 6,
      minutes: 80,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-2-2',
      player_id: 'team1-player-2',
      date: '2024-12-17',
      rpe: 6,
      minutes: 85,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-2-3',
      player_id: 'team1-player-2',
      date: '2024-12-16',
      rpe: 4,
      minutes: 60,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-2-4',
      player_id: 'team1-player-2',
      date: '2024-12-15',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-2-5',
      player_id: 'team1-player-2',
      date: '2024-12-14',
      rpe: 6,
      minutes: 75,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-2-6',
      player_id: 'team1-player-2',
      date: '2024-12-13',
      rpe: 4,
      minutes: 50,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-2-7',
      player_id: 'team1-player-2',
      date: '2024-12-12',
      rpe: 4,
      minutes: 60,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team1-player-3': [
    {
      id: 'cond-3-1',
      player_id: 'team1-player-3',
      date: '2024-12-18',
      rpe: 4,
      minutes: 45,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-3-2',
      player_id: 'team1-player-3',
      date: '2024-12-17',
      rpe: 4,
      minutes: 30,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-3-3',
      player_id: 'team1-player-3',
      date: '2024-12-16',
      rpe: 6,
      minutes: 60,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-3-4',
      player_id: 'team1-player-3',
      date: '2024-12-15',
      rpe: 4,
      minutes: 45,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-3-5',
      player_id: 'team1-player-3',
      date: '2024-12-14',
      rpe: 4,
      minutes: 40,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-3-6',
      player_id: 'team1-player-3',
      date: '2024-12-13',
      rpe: 6,
      minutes: 55,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-3-7',
      player_id: 'team1-player-3',
      date: '2024-12-12',
      rpe: 4,
      minutes: 35,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team1-player-4': [
    {
      id: 'cond-4-1',
      player_id: 'team1-player-4',
      date: '2024-12-18',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-4-2',
      player_id: 'team1-player-4',
      date: '2024-12-17',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-4-3',
      player_id: 'team1-player-4',
      date: '2024-12-16',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-4-4',
      player_id: 'team1-player-4',
      date: '2024-12-15',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-4-5',
      player_id: 'team1-player-4',
      date: '2024-12-14',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-4-6',
      player_id: 'team1-player-4',
      date: '2024-12-13',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-4-7',
      player_id: 'team1-player-4',
      date: '2024-12-12',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team1-player-5': [
    {
      id: 'cond-5-1',
      player_id: 'team1-player-5',
      date: '2024-12-18',
      rpe: 4,
      minutes: 20,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-5-2',
      player_id: 'team1-player-5',
      date: '2024-12-17',
      rpe: 4,
      minutes: 15,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-5-3',
      player_id: 'team1-player-5',
      date: '2024-12-16',
      rpe: 6,
      minutes: 30,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-5-4',
      player_id: 'team1-player-5',
      date: '2024-12-15',
      rpe: 4,
      minutes: 10,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-5-5',
      player_id: 'team1-player-5',
      date: '2024-12-14',
      rpe: 4,
      minutes: 25,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-5-6',
      player_id: 'team1-player-5',
      date: '2024-12-13',
      rpe: 6,
      minutes: 35,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-5-7',
      player_id: 'team1-player-5',
      date: '2024-12-12',
      rpe: 4,
      minutes: 20,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team2-player-1': [
    {
      id: 'cond-t2p1-1',
      player_id: 'team2-player-1',
      date: '2024-12-18',
      rpe: 8,
      minutes: 90,
      fatigue: '高',
      sleep: '悪',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-t2p1-2',
      player_id: 'team2-player-1',
      date: '2024-12-17',
      rpe: 8,
      minutes: 85,
      fatigue: '高',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-t2p1-3',
      player_id: 'team2-player-1',
      date: '2024-12-16',
      rpe: 6,
      minutes: 75,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-t2p1-4',
      player_id: 'team2-player-1',
      date: '2024-12-15',
      rpe: 8,
      minutes: 90,
      fatigue: '高',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-t2p1-5',
      player_id: 'team2-player-1',
      date: '2024-12-14',
      rpe: 6,
      minutes: 80,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-t2p1-6',
      player_id: 'team2-player-1',
      date: '2024-12-13',
      rpe: 8,
      minutes: 90,
      fatigue: '高',
      sleep: '悪',
      pain: 'あり',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-t2p1-7',
      player_id: 'team2-player-1',
      date: '2024-12-12',
      rpe: 6,
      minutes: 70,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team2-player-2': [
    {
      id: 'cond-t2p2-1',
      player_id: 'team2-player-2',
      date: '2024-12-18',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-t2p2-2',
      player_id: 'team2-player-2',
      date: '2024-12-17',
      rpe: 6,
      minutes: 85,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-t2p2-3',
      player_id: 'team2-player-2',
      date: '2024-12-16',
      rpe: 4,
      minutes: 65,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-t2p2-4',
      player_id: 'team2-player-2',
      date: '2024-12-15',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-t2p2-5',
      player_id: 'team2-player-2',
      date: '2024-12-14',
      rpe: 4,
      minutes: 70,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-t2p2-6',
      player_id: 'team2-player-2',
      date: '2024-12-13',
      rpe: 6,
      minutes: 80,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-t2p2-7',
      player_id: 'team2-player-2',
      date: '2024-12-12',
      rpe: 4,
      minutes: 60,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team2-player-3': [
    {
      id: 'cond-t2p3-1',
      player_id: 'team2-player-3',
      date: '2024-12-18',
      rpe: 4,
      minutes: 40,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-t2p3-2',
      player_id: 'team2-player-3',
      date: '2024-12-17',
      rpe: 4,
      minutes: 35,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-t2p3-3',
      player_id: 'team2-player-3',
      date: '2024-12-16',
      rpe: 6,
      minutes: 50,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-t2p3-4',
      player_id: 'team2-player-3',
      date: '2024-12-15',
      rpe: 4,
      minutes: 30,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-t2p3-5',
      player_id: 'team2-player-3',
      date: '2024-12-14',
      rpe: 6,
      minutes: 45,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-t2p3-6',
      player_id: 'team2-player-3',
      date: '2024-12-13',
      rpe: 4,
      minutes: 40,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-t2p3-7',
      player_id: 'team2-player-3',
      date: '2024-12-12',
      rpe: 4,
      minutes: 25,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team3-player-1': [
    {
      id: 'cond-t3p1-1',
      player_id: 'team3-player-1',
      date: '2024-12-18',
      rpe: 4,
      minutes: 50,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-t3p1-2',
      player_id: 'team3-player-1',
      date: '2024-12-17',
      rpe: 6,
      minutes: 60,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-t3p1-3',
      player_id: 'team3-player-1',
      date: '2024-12-16',
      rpe: 4,
      minutes: 45,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-t3p1-4',
      player_id: 'team3-player-1',
      date: '2024-12-15',
      rpe: 4,
      minutes: 40,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-t3p1-5',
      player_id: 'team3-player-1',
      date: '2024-12-14',
      rpe: 6,
      minutes: 55,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-t3p1-6',
      player_id: 'team3-player-1',
      date: '2024-12-13',
      rpe: 4,
      minutes: 35,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-t3p1-7',
      player_id: 'team3-player-1',
      date: '2024-12-12',
      rpe: 4,
      minutes: 30,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
  'team3-player-2': [
    {
      id: 'cond-t3p2-1',
      player_id: 'team3-player-2',
      date: '2024-12-18',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-18T10:00:00Z',
    },
    {
      id: 'cond-t3p2-2',
      player_id: 'team3-player-2',
      date: '2024-12-17',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-17T10:00:00Z',
    },
    {
      id: 'cond-t3p2-3',
      player_id: 'team3-player-2',
      date: '2024-12-16',
      rpe: 6,
      minutes: 80,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-16T10:00:00Z',
    },
    {
      id: 'cond-t3p2-4',
      player_id: 'team3-player-2',
      date: '2024-12-15',
      rpe: 4,
      minutes: 90,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-15T10:00:00Z',
    },
    {
      id: 'cond-t3p2-5',
      player_id: 'team3-player-2',
      date: '2024-12-14',
      rpe: 6,
      minutes: 85,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-14T10:00:00Z',
    },
    {
      id: 'cond-t3p2-6',
      player_id: 'team3-player-2',
      date: '2024-12-13',
      rpe: 4,
      minutes: 75,
      fatigue: '低',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-13T10:00:00Z',
    },
    {
      id: 'cond-t3p2-7',
      player_id: 'team3-player-2',
      date: '2024-12-12',
      rpe: 6,
      minutes: 90,
      fatigue: '中',
      sleep: '良',
      pain: 'なし',
      created_at: '2024-12-12T10:00:00Z',
    },
  ],
};

// デモ用の招待リンク
export const DEMO_INVITE_LINKS = [
  {
    id: 'demo-invite-1',
    team_id: 'demo-team-id',
    token: 'demo-token-123',
    label: 'チーム全体用',
    expires_at: '2025-12-31T23:59:59Z',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// デモモード判定用のヘルパー関数
export function isDemoMode(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === '';
}

// デモ用のチーム一覧取得関数
export function getDemoTeams() {
  return DEMO_TEAMS;
}

// デモ用のプレイヤー取得関数（チームIDでフィルタ）
export function getDemoPlayers(teamId?: string) {
  if (teamId) {
    return DEMO_PLAYERS_BY_TEAM[teamId] || [];
  }
  return DEMO_PLAYERS;
}

// デモ用のチームプロフィール取得関数
export function getDemoTeamProfile(teamId?: string) {
  if (teamId) {
    return DEMO_TEAM_PROFILES[teamId] || null;
  }
  return DEMO_TEAM_PROFILE;
}

// 1年分のコンディションデータを生成する関数
function generateYearlyConditions(playerId: string): any[] {
  const existingConditions = DEMO_CONDITIONS[playerId] || [];
  
  // 既存のデータの最新日付を取得（既存データがない場合は今日を基準にする）
  let baseDate: Date;
  if (existingConditions.length > 0) {
    // 既存データの最新日付を取得（デモモードでは古い順にソートされているので最後の要素）
    const sortedExisting = [...existingConditions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
    const latestExistingDate = sortedExisting[sortedExisting.length - 1]?.date;
    baseDate = latestExistingDate ? parseYmd(latestExistingDate) : new Date();
  } else {
    baseDate = new Date();
  }
  
  const conditions: any[] = [];
  
  // 選手の特性に基づいてベース値を設定（選手IDから推測）
  const isHighLoadPlayer = playerId.includes('player-1') || playerId.includes('player-2');
  const isLowLoadPlayer = playerId.includes('player-3') || playerId.includes('player-5');
  const isGK = playerId.includes('player-4');
  
  // 既存データを結果に追加
  existingConditions.forEach((c: any) => {
    conditions.push(c);
  });
  
  // 既存データの日付セットを作成（重複チェック用）
  const existingDates = new Set(existingConditions.map((c: any) => c.date));
  
  // 過去365日分のデータを生成（既存の最新日付より前の日付のみ）
  for (let i = 364; i >= 1; i--) { // i >= 1 に変更（既存データの日付はスキップ）
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    const dateStr = yyyyMmDd(date);
    
    // 既存のデータがある場合はスキップ
    if (existingDates.has(dateStr)) {
      continue;
    }
    
    // 曜日を取得（0=日曜日、6=土曜日）
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // ベース値の設定
    let baseRPE = 5;
    let baseMinutes = 60;
    
    if (isHighLoadPlayer) {
      baseRPE = 6;
      baseMinutes = 80;
    } else if (isLowLoadPlayer) {
      baseRPE = 4;
      baseMinutes = 40;
    } else if (isGK) {
      baseRPE = 4;
      baseMinutes = 90; // GKはフルタイム出場が多い
    }
    
    // 週末は試合がある可能性が高いので負荷を上げる
    if (isWeekend) {
      baseRPE += 1;
      baseMinutes = Math.min(baseMinutes + 10, 90);
    }
    
    // ランダムな変動を追加（±2の範囲）
    const rpeVariation = Math.floor(Math.random() * 5) - 2; // -2 to 2
    const rpe = Math.max(3, Math.min(9, baseRPE + rpeVariation));
    
    const minutesVariation = Math.floor(Math.random() * 20) - 10; // -10 to 10
    const minutes = Math.max(0, Math.min(90, baseMinutes + minutesVariation));
    
    // 疲労と睡眠はRPEと連動させる
    let fatigue: "低" | "中" | "高";
    let sleep: "良" | "普通" | "悪";
    
    if (rpe >= 7) {
      fatigue = Math.random() > 0.3 ? "高" : "中";
      sleep = Math.random() > 0.4 ? "悪" : "普通";
    } else if (rpe >= 5) {
      fatigue = Math.random() > 0.5 ? "中" : "低";
      sleep = Math.random() > 0.6 ? "良" : "普通";
    } else {
      fatigue = Math.random() > 0.7 ? "中" : "低";
      sleep = Math.random() > 0.8 ? "普通" : "良";
    }
    
    // 痛みは低確率で発生
    const pain = Math.random() > 0.9 ? "あり" : "なし";
    
    conditions.push({
      id: `cond-${playerId}-${dateStr}`,
      player_id: playerId,
      date: dateStr,
      rpe,
      minutes,
      fatigue,
      sleep,
      pain,
      created_at: `${dateStr}T10:00:00Z`,
    });
  }
  
  return conditions;
}

// デモ用のプレイヤーコンディション取得関数
export function getDemoPlayerConditions(playerId: string, limit?: number) {
  // 既存のデータを取得
  let conditions = DEMO_CONDITIONS[playerId] || [];
  
  // 1年分のデータが不足している場合は生成
  if (conditions.length < 365) {
    const generated = generateYearlyConditions(playerId);
    // 既存のデータとマージ（重複を避ける）
    const existingDates = new Set(conditions.map((c: any) => c.date));
    const newConditions = generated.filter((c: any) => !existingDates.has(c.date));
    conditions = [...conditions, ...newConditions];
  }
  
  // 日付順（古い順）にソート
  const sorted = [...conditions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
  
  // limitが指定されている場合、最新のlimit個を返す（配列の最後から取得）
  if (limit) {
    return sorted.slice(-limit);
  }
  return sorted;
}

// デモ用のプレイヤープロフィール取得関数
export function getDemoPlayerProfile(playerId: string) {
  // 全チームから検索
  for (const players of Object.values(DEMO_PLAYERS_BY_TEAM)) {
    const player = players.find(p => p.id === playerId);
    if (player) {
      return player.player_profiles || null;
    }
  }
  return null;
}

// デモ用の招待リンク取得関数
export function getDemoInviteLinks() {
  return DEMO_INVITE_LINKS;
}

