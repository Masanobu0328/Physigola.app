// Supabase Database Types
// Generated from schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_profiles: {
        Row: {
          team_id: string
          category: string
          level: string
          weekly_sessions: string
          match_frequency: string
          active_days: string[]
          policy: string
          created_at: string
          updated_at: string
        }
        Insert: {
          team_id: string
          category: string
          level: string
          weekly_sessions: string
          match_frequency: string
          active_days: string[]
          policy: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          team_id?: string
          category?: string
          level?: string
          weekly_sessions?: string
          match_frequency?: string
          active_days?: string[]
          policy?: string
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string
          jersey_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          jersey_number: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          jersey_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      player_profiles: {
        Row: {
          player_id: string
          age_band: string
          position: string
          dominant_foot: string
          playing_status: string
          current_injury_status: string
          past_injuries: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          player_id: string
          age_band: string
          position: string
          dominant_foot: string
          playing_status: string
          current_injury_status: string
          past_injuries?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          player_id?: string
          age_band?: string
          position?: string
          dominant_foot?: string
          playing_status?: string
          current_injury_status?: string
          past_injuries?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      daily_conditions: {
        Row: {
          id: string
          player_id: string
          date: string
          rpe: number
          minutes: number
          srpe: number
          fatigue: '低' | '中' | '高'
          sleep: '良' | '普通' | '悪'
          pain: 'なし' | 'あり'
          pain_sites: string | null
          comment: string | null
          created_by_role: 'player' | 'admin'
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          date: string
          rpe: number
          minutes: number
          fatigue: '低' | '中' | '高'
          sleep: '良' | '普通' | '悪'
          pain: 'なし' | 'あり'
          pain_sites?: string | null
          comment?: string | null
          created_by_role: 'player' | 'admin'
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          date?: string
          rpe?: number
          minutes?: number
          fatigue?: '低' | '中' | '高'
          sleep?: '良' | '普通' | '悪'
          pain?: 'なし' | 'あり'
          pain_sites?: string | null
          comment?: string | null
          created_by_role?: 'player' | 'admin'
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_invite_links: {
        Row: {
          id: string
          team_id: string
          token: string
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          token: string
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          token?: string
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          actor_role: 'player' | 'admin' | 'system'
          actor_user_id: string | null
          before: Json | null
          after: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          actor_role: 'player' | 'admin' | 'system'
          actor_user_id?: string | null
          before?: Json | null
          after?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          actor_role?: 'player' | 'admin' | 'system'
          actor_user_id?: string | null
          before?: Json | null
          after?: Json | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'admin' | 'trainer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          team_id: string
          email: string
          role?: 'admin' | 'trainer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: 'admin' | 'trainer'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_team_id: {
        Args: Record<string, never>
        Returns: string
      }
      is_admin_for_team: {
        Args: { target_team_id: string }
        Returns: boolean
      }
      get_team_id_from_token: {
        Args: { invite_token: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

