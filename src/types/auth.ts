export interface PilotProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  favorite_team: string | null;
  role: 'pilot' | 'admin';
  pitcoins: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null;
  profile: PilotProfile | null;
  session: any | null;
  isLoading: boolean;
}
