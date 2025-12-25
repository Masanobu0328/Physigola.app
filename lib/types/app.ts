// アプリケーション型定義

export interface AdminUser {
  id: string;
  team_id: string;
  email: string;
  role: string;
  teams?: {
    id: string;
    name: string;
  };
}

