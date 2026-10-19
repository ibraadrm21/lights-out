export type DailyGameId = 
  | 'quiz' 
  | 'driverle' 
  | 'reaction' 
  | 'higher_lower' 
  | 'helmet_guess' 
  | 'circuits';

export interface DailyGameMeta {
  id: DailyGameId;
  title: string;
  subtitle: string;
  categoryTag: string;
  color: string;
  iconName: string;
  targetGoal: string;
  maxScore: number;
  rewardPitcoins: number;
}

export interface DailyGameRound {
  id: DailyGameId;
  meta: DailyGameMeta;
  challengeDate: string; // YYYY-MM-DD (UTC)
  config: Record<string, any>;
}

export interface DailyRoundAttempt {
  gameId: DailyGameId;
  challengeDate: string;
  score: number;
  completed: boolean;
  rewardClaimed: boolean;
  rewardAmount: number;
  consumed: boolean;
  attemptPayload?: any;
  createdAt: string;
}

export interface UserDailySummary {
  userId: string;
  challengeDate: string;
  totalScore: number;
  gamesCompleted: number;
  totalGamesAvailable: number;
  currentStreak: number;
  maxStreak: number;
}

export interface DailyCumulativeLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  totalScore: number;
  gamesCompleted: number;
  totalGamesAvailable: number;
  isCurrentUser?: boolean;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  max_streak: number;
  last_completed_date: string | null;
  total_completed: number;
  updated_at: string;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  target_progress: number;
  current_progress: number;
  completed: boolean;
  reward_claimed: boolean;
  reward_pitcoins: number;
}
