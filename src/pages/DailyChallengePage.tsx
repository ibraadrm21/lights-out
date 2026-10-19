import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Flame, Trophy, Award, Zap, CheckCircle2, Clock, 
  ArrowRight, Play, ShieldAlert, Sparkles, AlertCircle, RefreshCw,
  Lock, Check, Target, Timer, Eye, MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DailyChallengeService, 
  getDailyGameRounds, 
  getUtcDateString 
} from '../lib/dailyService';
import type { 
  DailyGameRound, 
  DailyRoundAttempt, 
  DailyCumulativeLeaderboardEntry,
  UserStreak,
  DailyGameId
} from '../types/daily';
import { DailyGameModal } from '../components/daily/DailyGameModal';
import { PitCoinIcon } from '../components/common/F1Icons';

export const DailyChallengePage: React.FC = () => {
  const { user, profile, earnCoins } = useAuth();
  const [rounds, setRounds] = useState<DailyGameRound[]>([]);
  const [attempts, setAttempts] = useState<Record<DailyGameId, DailyRoundAttempt>>({} as any);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [leaderboard, setLeaderboard] = useState<DailyCumulativeLeaderboardEntry[]>([]);
  
  const [activeRound, setActiveRound] = useState<DailyGameRound | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const todayStr = getUtcDateString();

  const loadData = async () => {
    setLoading(true);
    try {
      const generatedRounds = getDailyGameRounds(todayStr);
      setRounds(generatedRounds);

      const [userAtts, st, lb] = await Promise.all([
        DailyChallengeService.getUserDailyAttempts(todayStr, user?.id),
        DailyChallengeService.getUserStreak(user?.id),
        DailyChallengeService.getCumulativeDailyLeaderboard(todayStr, user?.id)
      ]);

      setAttempts(userAtts);
      setStreak(st);
      setLeaderboard(lb);
    } catch (e) {
      console.error('Error loading daily challenge data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRoundComplete = async (result: {
    score: number;
    completed: boolean;
    payload?: any;
  }) => {
    if (!activeRound) return;
    setSubmitting(true);
    const roundToSubmit = activeRound;
    setActiveRound(null);

    try {
      const res = await DailyChallengeService.submitGameRound({
        gameId: roundToSubmit.id,
        dateStr: todayStr,
        score: result.score,
        completed: result.completed,
        rewardPitcoins: roundToSubmit.meta.rewardPitcoins,
        payload: result.payload,
        user,
        profile,
        earnCoinsFn: earnCoins
      });

      setFeedbackMessage(res.message);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage('Error al registrar la ronda: ' + (err.message || 'Error de red'));
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live cumulative totals for the user
  const totalUserScore = Object.values(attempts).reduce((acc, att) => acc + (att.score || 0), 0);
  const completedCount = Object.values(attempts).filter(att => att.completed).length;
  const attemptedCount = Object.values(attempts).length;

  return (
    <main className="bg-[#15151E] min-h-screen text-white pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header telemetry */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-[#e10600] uppercase bg-[#e10600]/10 px-2 py-0.5 border border-[#e10600]/30">
                OFFICIAL FIA PADDOCK // MULTI-MINIGAME DAILY HUB
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
                UTC {todayStr}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight">
              DAILY <span className="text-[#e10600]">CHALLENGE</span>
            </h1>
          </div>

          {/* User Telemetry Card: Score, Games Completed, Streak */}
          <div className="flex flex-wrap items-center gap-4 bg-[#0a0a0f] border border-white/10 px-5 py-3">
            {/* Streak */}
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Flame size={16} className="fill-amber-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[8px] font-mono text-white/40 uppercase block">Racha</span>
                <span className="text-base font-mono font-bold text-amber-400">
                  {streak?.current_streak || 0} DÍAS
                </span>
              </div>
            </div>

            {/* Games Completed */}
            <div className="pr-4 border-r border-white/10">
              <span className="text-[8px] font-mono text-white/40 uppercase block">Rondas Jugadas</span>
              <span className="text-base font-mono font-bold text-white">
                {completedCount} <span className="text-white/40 text-xs">/ {rounds.length}</span>
              </span>
            </div>

            {/* Total Daily Points */}
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase block">Puntos Acumulados</span>
              <span className="text-base font-syne font-black text-emerald-400">
                {totalUserScore} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-[#0a0a0f] border border-[#e10600]/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm font-mono">
                <Sparkles size={16} className="text-[#e10600]" />
                <span>{feedbackMessage}</span>
              </div>
              <button 
                onClick={() => setFeedbackMessage(null)}
                className="text-white/40 hover:text-white text-xs font-mono uppercase cursor-pointer"
              >
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Concept Banner: Voluntary Participation, 1 attempt, cumulative score */}
        <div className="mb-8 p-5 bg-[#0e0e14] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-syne font-bold text-sm text-white uppercase tracking-wide mb-1 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Competición Diaria Global: 1 Ronda Por Minijuego
            </h3>
            <p className="text-xs text-white/60 leading-relaxed max-w-3xl">
              Participación completamente libre: juega solo a los minijuegos que te apetezcan. Cada ronda otorga puntos a tu total diario y 1 intento oficial por día. Con completar al menos un juego mantendrás tu racha.
            </p>
          </div>
          <div className="text-[9px] font-mono text-white/40 uppercase bg-black/40 px-3 py-2 border border-white/5 whitespace-nowrap">
            REINICIO DIARIO: 00:00 UTC
          </div>
        </div>

        {/* 6 DAILY MINIGAME CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {rounds.map((rnd) => {
            const att = attempts[rnd.id];
            const isConsumed = Boolean(att?.consumed);
            const isCompleted = Boolean(att?.completed);

            return (
              <div
                key={rnd.id}
                className="bg-[#0e0e14] border transition-all flex flex-col justify-between p-6 relative overflow-hidden"
                style={{
                  borderTopColor: rnd.meta.color,
                  borderTopWidth: '3px',
                  borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span 
                      className="text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase border"
                      style={{ color: rnd.meta.color, borderColor: `${rnd.meta.color}30`, backgroundColor: `${rnd.meta.color}10` }}
                    >
                      {rnd.meta.categoryTag}
                    </span>
                    <span className="text-[9px] font-mono text-yellow-400 font-bold flex items-center gap-1">
                      <PitCoinIcon size={12} />
                      +{rnd.meta.rewardPitcoins}
                    </span>
                  </div>

                  <h3 className="text-xl font-black font-syne text-white uppercase mb-1">
                    {rnd.meta.title}
                  </h3>
                  <p className="text-xs text-white/60 mb-4 leading-relaxed">
                    {rnd.meta.subtitle}
                  </p>

                  <div className="p-2.5 bg-black/40 border border-white/5 text-[10px] font-mono text-white/70 mb-6">
                    <span className="text-white/40 block mb-0.5">OBJETIVO DE LA RONDA:</span>
                    {rnd.meta.targetGoal}
                  </div>
                </div>

                {/* Status / Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {isConsumed ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={14} /> SUPERADO
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-white/40 flex items-center gap-1">
                            <Lock size={12} /> INTENTO CONSUMIDO
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-mono font-bold text-white">
                        {att.score} PTS
                      </span>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/40 uppercase">
                        HASTA {rnd.meta.maxScore} PTS
                      </span>
                      <button
                        onClick={() => setActiveRound(rnd)}
                        className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-bold text-[10px] font-mono tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Play size={11} className="fill-black" />
                        <span>JUGAR RONDA</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DAILY CUMULATIVE LEADERBOARD */}
        <div className="bg-[#0a0a0f] border border-white/10 overflow-hidden mb-12">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#e10600] uppercase block mb-1">
                CLASIFICACIÓN GLOBAL DEL DÍA // ACUMULADA
              </span>
              <h2 className="text-2xl font-black font-syne uppercase">
                DAILY <span className="text-[#e10600]">STANDINGS</span>
              </h2>
            </div>
            <div className="text-[10px] font-mono text-white/40 uppercase">
              ORDENADO POR PUNTUACIÓN TOTAL Y JUEGOS COMPLETADOS
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#14141e] border-b border-white/10 text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase">
            <div className="col-span-1 text-center">POS</div>
            <div className="col-span-6">PILOTO / PADDOCK</div>
            <div className="col-span-3 text-right">RONDAS COMPLETADAS</div>
            <div className="col-span-2 text-right">PUNTUACIÓN TOTAL</div>
          </div>

          <div className="divide-y divide-white/5">
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-white/40 uppercase">
                Aún no hay participantes en las rondas de hoy. ¡Sé el primero en puntuar!
              </div>
            ) : (
              leaderboard.map((item) => (
                <div
                  key={`${item.rank}-${item.userId}`}
                  className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors ${
                    item.isCurrentUser ? 'bg-[#e10600]/15 border-l-2 border-[#e10600]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="col-span-1 text-center font-mono font-bold text-sm text-white/70">
                    #{item.rank}
                  </div>
                  <div className="col-span-6 font-syne font-bold text-sm text-white flex items-center gap-2">
                    <span>{item.displayName}</span>
                    {item.isCurrentUser && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 bg-[#e10600] text-white">TÚ</span>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-white/70">
                    <span className="font-bold text-white">{item.gamesCompleted}</span>
                    <span className="text-white/40"> / {item.totalGamesAvailable} juegos</span>
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-sm text-emerald-400">
                    {item.totalScore} PTS
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE ROUND MODAL */}
      {activeRound && (
        <DailyGameModal
          round={activeRound}
          onComplete={handleRoundComplete}
          onCancel={() => setActiveRound(null)}
        />
      )}
    </main>
  );
};
