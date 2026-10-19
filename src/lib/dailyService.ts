/**
 * LIGHTS OUT DAILY CHALLENGE SERVICE
 * Multi-Minigame Daily Hub:
 * 1. Generates 6 deterministic rounds per UTC date (Quiz, Driverle, Reaction, Higher/Lower, Helmet, Circuits).
 * 2. 100% voluntary participation (play 1, 3 or all 6).
 * 3. Exactly 1 consumable scored attempt per game/date.
 * 4. Cumulative score = sum of completed rounds.
 * 5. Global leaderboard displays total score AND number of games completed (e.g. 850 PTS • 3/6 juegos).
 * 6. Daily streak advances when completing AT LEAST 1 round on that day.
 */

import { supabase } from './supabase';
import { F1AIEngine } from './lightsout/ai-engine.js';
import { F1_DRIVERS, F1_CIRCUITS } from './lightsout/data.js';
import { REAL_HELMETS } from '../components/f1/HelmetGuessGameView';
import type { 
  DailyGameId, 
  DailyGameRound, 
  DailyGameMeta,
  DailyRoundAttempt, 
  UserDailySummary,
  DailyCumulativeLeaderboardEntry,
  UserStreak,
  WeeklyMission
} from '../types/daily';

// Helper: Get Official UTC Date String (YYYY-MM-DD)
export function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// Helper: Get ISO Week Key (e.g. '2026-W42')
export function getIsoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Deterministic Pseudo-Random Number Generator based on string seed
export function pseudoRandom(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

export const DAILY_GAMES_METADATA: Record<DailyGameId, DailyGameMeta> = {
  quiz: {
    id: 'quiz',
    title: 'Quiz Master',
    subtitle: 'Tanda oficial de 5 preguntas técnicas',
    categoryTag: 'TELEMETRÍA & CULTURA',
    color: '#facc15',
    iconName: 'Zap',
    targetGoal: 'Acertar al menos 3 de 5 preguntas',
    maxScore: 500,
    rewardPitcoins: 150
  },
  driverle: {
    id: 'driverle',
    title: 'Driverle',
    subtitle: 'Piloto misterioso del día por telemetría',
    categoryTag: 'DETECTIVE DE PARRILLA',
    color: '#00d2be',
    iconName: 'Target',
    targetGoal: 'Adivinar el piloto en <= 6 intentos',
    maxScore: 600,
    rewardPitcoins: 150
  },
  reaction: {
    id: 'reaction',
    title: 'Reaction Test',
    subtitle: 'Semáforo oficial de 5 luces con retardo fijo',
    categoryTag: 'REFLEJOS & PROTOCOLO FIA',
    color: '#e10600',
    iconName: 'Timer',
    targetGoal: 'Tiempo de reacción < 260 ms',
    maxScore: 400,
    rewardPitcoins: 150
  },
  higher_lower: {
    id: 'higher_lower',
    title: 'Higher or Lower',
    subtitle: 'Duelo estadístico de 3 comparaciones directas',
    categoryTag: 'ESTADÍSTICA HISTÓRICA',
    color: '#f97316',
    iconName: 'Flame',
    targetGoal: 'Acertar al menos 2 de los 3 duelos',
    maxScore: 450,
    rewardPitcoins: 150
  },
  helmet_guess: {
    id: 'helmet_guess',
    title: 'HelmetGuess',
    subtitle: 'Casco histórico icónico de la parrilla',
    categoryTag: 'RECONOCIMIENTO VISUAL',
    color: '#38bdf8',
    iconName: 'Eye',
    targetGoal: 'Identificar al piloto del casco con <= 2 pistas',
    maxScore: 500,
    rewardPitcoins: 150
  },
  circuits: {
    id: 'circuits',
    title: 'Circuit GeoGuessr',
    subtitle: 'Localización de trazado oficial en el mapa',
    categoryTag: 'GEOGRAFÍA & APEX',
    color: '#a855f7',
    iconName: 'MapPin',
    targetGoal: 'Marcar el circuito a < 500 km de error',
    maxScore: 500,
    rewardPitcoins: 150
  }
};

/**
 * Returns the 6 daily game rounds deterministically for the given UTC date.
 */
export function getDailyGameRounds(dateStr: string = getUtcDateString()): DailyGameRound[] {
  const gameIds: DailyGameId[] = ['quiz', 'driverle', 'reaction', 'higher_lower', 'helmet_guess', 'circuits'];

  return gameIds.map(gameId => {
    const meta = DAILY_GAMES_METADATA[gameId];
    const seed = `${dateStr}_${gameId}`;
    let config: Record<string, any> = {};

    switch (gameId) {
      case 'quiz': {
        const engine = new F1AIEngine();
        const allQuestions = engine.generateAllCandidateQuestions();
        const selected = [];
        for (let i = 0; i < 5; i++) {
          const idx = Math.floor(pseudoRandom(`${seed}_q_${i}`) * allQuestions.length);
          const q = allQuestions[idx];
          selected.push({
            hash: q.hash,
            category: q.category,
            difficulty: q.difficulty,
            text: q.text,
            options: q.getOptions(),
            points: q.points,
            explanation: q.explanation
          });
        }
        config = { questionCount: 5, minCorrect: 3, questions: selected };
        break;
      }
      case 'driverle': {
        const eligible = F1_DRIVERS.filter((d: any) => d.gps >= 10);
        const idx = Math.floor(pseudoRandom(`${seed}_target`) * eligible.length);
        const target = eligible[idx];
        config = {
          targetDriverId: target.id,
          targetDriverName: target.name,
          maxAttempts: 6
        };
        break;
      }
      case 'reaction': {
        const holdDelay = 1500 + Math.floor(pseudoRandom(`${seed}_hold`) * 2000);
        config = {
          targetReactionMs: 260,
          fixedHoldMs: holdDelay,
          attemptsAllowed: 3
        };
        break;
      }
      case 'higher_lower': {
        const eligible = F1_DRIVERS.filter((d: any) => (d.wins > 0 || d.podiums > 5 || d.championships > 0));
        const duels = [];
        const metrics = ['wins', 'podiums', 'poles', 'championships', 'gps'];
        for (let i = 0; i < 3; i++) {
          const idxA = Math.floor(pseudoRandom(`${seed}_d1_${i}`) * eligible.length);
          let idxB = Math.floor(pseudoRandom(`${seed}_d2_${i}`) * eligible.length);
          if (idxA === idxB) idxB = (idxB + 1) % eligible.length;
          const metricKey = metrics[Math.floor(pseudoRandom(`${seed}_m_${i}`) * metrics.length)];
          const dA = eligible[idxA];
          const dB = eligible[idxB];
          duels.push({
            driverA: dA,
            driverB: dB,
            metricKey,
            valA: dA[metricKey] || 0,
            valB: dB[metricKey] || 0
          });
        }
        config = { duels, minWins: 2 };
        break;
      }
      case 'helmet_guess': {
        const idx = Math.floor(pseudoRandom(`${seed}_helmet`) * REAL_HELMETS.length);
        const helmet = REAL_HELMETS[idx];
        config = {
          helmetId: helmet.id,
          helmet
        };
        break;
      }
      case 'circuits': {
        const idx = Math.floor(pseudoRandom(`${seed}_circuit`) * F1_CIRCUITS.length);
        const circuit = F1_CIRCUITS[idx];
        config = {
          circuitId: circuit.id,
          circuitName: circuit.name,
          country: circuit.country,
          targetLat: circuit.lat,
          targetLng: circuit.lng,
          maxKmError: 500
        };
        break;
      }
    }

    return {
      id: gameId,
      meta,
      challengeDate: dateStr,
      config
    };
  });
}

const LS_ROUND_ATTEMPTS = 'lightsout_round_attempts';
const LS_USER_STREAK = 'lightsout_user_streak';

export class DailyChallengeService {
  /**
   * Fetches all user attempts for the specified UTC date.
   */
  static async getUserDailyAttempts(dateStr: string = getUtcDateString(), userId?: string): Promise<Record<DailyGameId, DailyRoundAttempt>> {
    const attemptsMap = {} as Record<DailyGameId, DailyRoundAttempt>;

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('daily_game_attempts')
          .select('*')
          .eq('challenge_date', dateStr)
          .eq('user_id', userId);

        if (!error && data) {
          data.forEach((row: any) => {
            attemptsMap[row.game_id as DailyGameId] = {
              gameId: row.game_id,
              challengeDate: row.challenge_date,
              score: row.score,
              completed: row.completed,
              rewardClaimed: row.reward_claimed,
              rewardAmount: row.reward_amount,
              consumed: true,
              attemptPayload: row.attempt_payload,
              createdAt: row.created_at
            };
          });
        }
      } catch (e) {}
    }

    // Merge with local storage fallback
    try {
      const storageKey = userId 
        ? `${LS_ROUND_ATTEMPTS}_${userId}_${dateStr}`
        : `${LS_ROUND_ATTEMPTS}_${dateStr}`;
      const localStored = localStorage.getItem(storageKey);
      if (localStored) {
        const parsed = JSON.parse(localStored);
        Object.keys(parsed).forEach(k => {
          const gid = k as DailyGameId;
          if (!attemptsMap[gid]) {
            attemptsMap[gid] = parsed[gid];
          }
        });
      }
    } catch {}

    return attemptsMap;
  }

  /**
   * Submits a completed round for a single minigame.
   * Enforces 1 attempt per game/day, updates user daily summary, awards coins, advances streak.
   */
  static async submitGameRound(params: {
    gameId: DailyGameId;
    dateStr: string;
    score: number;
    completed: boolean;
    rewardPitcoins: number;
    payload?: any;
    user?: any;
    profile?: any;
    earnCoinsFn?: (amt: number, reason: string) => Promise<any>;
  }): Promise<{
    success: boolean;
    consumed: boolean;
    score: number;
    rewardClaimed: boolean;
    rewardAmount: number;
    message: string;
  }> {
    const { gameId, dateStr, score, completed, rewardPitcoins, payload, user, earnCoinsFn } = params;
    const userId = user?.id;

    // Check if user already submitted this minigame today
    const existingMap = await this.getUserDailyAttempts(dateStr, userId);
    if (existingMap[gameId]?.consumed) {
      return {
        success: true,
        consumed: true,
        score: existingMap[gameId].score,
        rewardClaimed: false,
        rewardAmount: 0,
        message: 'Ya has completado tu ronda diaria de este minijuego. El intento está consumido.'
      };
    }

    const reward = completed ? rewardPitcoins : 0;
    const rewardClaimed = completed;

    // 1. Supabase RPC if online
    if (userId) {
      try {
        const { data, error } = await supabase.rpc('submit_daily_game_round', {
          p_challenge_date: dateStr,
          p_game_id: gameId,
          p_score: score,
          p_completed: completed,
          p_reward_pitcoins: reward,
          p_payload: payload || {}
        });

        if (!error && data) {
          if (rewardClaimed && earnCoinsFn) {
            earnCoinsFn(0, 'Daily Sync');
          }
          return {
            success: true,
            consumed: true,
            score: data.score,
            rewardClaimed: data.reward_claimed,
            rewardAmount: data.reward_amount,
            message: completed 
              ? `¡Ronda completada! +${score} PTS añadidos a tu total diario (+${reward} PitCoins).`
              : `Ronda finalizada. +${score} PTS registrados.`
          };
        }
      } catch (e) {
        console.warn('RPC submit_daily_game_round unavailable, processing locally:', e);
      }
    }

    // 2. Offline / Local fallback
    const storageKey = userId 
      ? `${LS_ROUND_ATTEMPTS}_${userId}_${dateStr}`
      : `${LS_ROUND_ATTEMPTS}_${dateStr}`;
    
    let localMap: Record<string, DailyRoundAttempt> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) localMap = JSON.parse(stored);
    } catch {}

    const attempt: DailyRoundAttempt = {
      gameId,
      challengeDate: dateStr,
      score,
      completed,
      rewardClaimed,
      rewardAmount: reward,
      consumed: true,
      attemptPayload: payload,
      createdAt: new Date().toISOString()
    };
    localMap[gameId] = attempt;
    localStorage.setItem(storageKey, JSON.stringify(localMap));

    // Update streak: at least 1 completed game advances streak
    if (completed) {
      await this.advanceUserStreak(dateStr, userId);
      if (reward > 0 && earnCoinsFn) {
        await earnCoinsFn(reward, `Daily Round (${DAILY_GAMES_METADATA[gameId].title})`);
      }
    }

    return {
      success: true,
      consumed: true,
      score,
      rewardClaimed,
      rewardAmount: reward,
      message: completed 
        ? `¡Ronda superada! +${score} PTS acumulados para el ranking diario (+${reward} PitCoins).`
        : `Ronda finalizada. Intento consumido (+${score} PTS).`
    };
  }

  /**
   * Advances daily streak idempotently.
   */
  private static async advanceUserStreak(todayStr: string, userId?: string): Promise<UserStreak> {
    const streakKey = userId ? `${LS_USER_STREAK}_${userId}` : LS_USER_STREAK;
    const current = await this.getUserStreak(userId);
    let newCurrent = 1;

    if (current.last_completed_date === todayStr) {
      // Already counted today
      return current;
    } else if (current.last_completed_date) {
      const last = new Date(current.last_completed_date);
      const cur = new Date(todayStr);
      const diff = Math.round((cur.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        newCurrent = current.current_streak + 1;
      }
    }

    const updated: UserStreak = {
      user_id: userId || 'local_user',
      current_streak: newCurrent,
      max_streak: Math.max(current.max_streak, newCurrent),
      last_completed_date: todayStr,
      total_completed: current.total_completed + 1,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(streakKey, JSON.stringify(updated));
    return updated;
  }

  /**
   * Gets user streak.
   */
  static async getUserStreak(userId?: string): Promise<UserStreak> {
    const streakKey = userId ? `${LS_USER_STREAK}_${userId}` : LS_USER_STREAK;
    const today = getUtcDateString();

    const defaultStreak: UserStreak = {
      user_id: userId || 'local_user',
      current_streak: 0,
      max_streak: 0,
      last_completed_date: null,
      total_completed: 0,
      updated_at: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(streakKey);
      if (stored) {
        const s = JSON.parse(stored);
        if (!s.last_completed_date) return s;
        if (s.last_completed_date === today) return s;
        const diff = Math.round((new Date(today).getTime() - new Date(s.last_completed_date).getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 1) {
          return { ...s, current_streak: 0 };
        }
        return s;
      }
    } catch {}

    return defaultStreak;
  }

  /**
   * Fetches cumulative daily leaderboard showing total score AND games completed (e.g. 850 PTS • 3/6 juegos).
   */
  static async getCumulativeDailyLeaderboard(dateStr: string = getUtcDateString(), currentUserId?: string): Promise<DailyCumulativeLeaderboardEntry[]> {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('daily_user_summaries')
        .select(`
          user_id,
          total_score,
          games_completed,
          profiles ( username, display_name, avatar_url )
        `)
        .eq('challenge_date', dateStr)
        .order('total_score', { ascending: false })
        .order('games_completed', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((row: any, idx: number) => ({
          rank: idx + 1,
          userId: row.user_id,
          username: row.profiles?.username || 'Pilot_' + row.user_id.slice(0, 4),
          displayName: row.profiles?.display_name || row.profiles?.username || 'Piloto F1',
          avatarUrl: row.profiles?.avatar_url,
          totalScore: row.total_score,
          gamesCompleted: row.games_completed,
          totalGamesAvailable: 6,
          isCurrentUser: row.user_id === currentUserId
        }));
      }
    } catch (e) {}

    // Realistic paddock benchmark entries
    const benchmarkEntries: DailyCumulativeLeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'bench_1',
        username: 'ApexPredator_1',
        displayName: 'Max V. (Paddock Pro)',
        totalScore: 2350,
        gamesCompleted: 6,
        totalGamesAvailable: 6
      },
      {
        rank: 2,
        userId: 'bench_2',
        username: 'MonacoMaster',
        displayName: 'Charles L. (Telemetry)',
        totalScore: 1890,
        gamesCompleted: 5,
        totalGamesAvailable: 6
      },
      {
        rank: 3,
        userId: 'bench_3',
        username: 'SilverstoneKing',
        displayName: 'Lewis H. (Apex)',
        totalScore: 1420,
        gamesCompleted: 4,
        totalGamesAvailable: 6
      },
      {
        rank: 4,
        userId: 'bench_4',
        username: 'PitWallStrategist',
        displayName: 'Fernando A. (Veteran)',
        totalScore: 920,
        gamesCompleted: 2,
        totalGamesAvailable: 6
      }
    ];

    // Compute current user's local score from attempts
    const userAttempts = await this.getUserDailyAttempts(dateStr, currentUserId);
    const completedAttempts = Object.values(userAttempts).filter(a => a.completed);
    const userTotalScore = Object.values(userAttempts).reduce((acc, a) => acc + (a.score || 0), 0);

    if (Object.keys(userAttempts).length > 0) {
      // Fetch user profile if available in local storage or supabase
      let pName = 'Tú (Piloto Oficial)';
      let pUser = 'Tú';
      try {
        const raw = localStorage.getItem('local_db_profiles');
        if (raw) {
          const profiles = JSON.parse(raw);
          const found = profiles.find((p: any) => p.id === currentUserId);
          if (found) {
            pName = found.display_name || found.username || pName;
            pUser = found.username || pUser;
          }
        }
      } catch {}

      const userEntry: DailyCumulativeLeaderboardEntry = {
        rank: 0,
        userId: currentUserId || 'local_user',
        username: pUser,
        displayName: pName,
        totalScore: userTotalScore,
        gamesCompleted: completedAttempts.length,
        totalGamesAvailable: 6,
        isCurrentUser: true
      };

      const sorted = [...benchmarkEntries.filter(b => b.userId !== userEntry.userId), userEntry]
        .sort((a, b) => b.totalScore - a.totalScore || b.gamesCompleted - a.gamesCompleted)
        .map((e, idx) => ({ ...e, rank: idx + 1 }));

      return sorted;
    }

    return benchmarkEntries;
  }
}
