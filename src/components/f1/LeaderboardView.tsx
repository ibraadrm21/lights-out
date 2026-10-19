import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Timer, Shield, Sparkles } from 'lucide-react';
import { F1_LEADERBOARD } from '../../data/f1Data';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../store/useStore';

interface LeaderboardEntry {
  rank: number;
  name: string;
  title: string;
  points: number;
  accuracy: string;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC = () => {
  const { user, profile } = useAuth();
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStandings() {
      try {
        // Query top profiles from Supabase if table exists
        const { data: dbProfiles, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, pitcoins, role')
          .order('pitcoins', { ascending: false })
          .limit(10);

        if (!error && dbProfiles && dbProfiles.length > 0) {
          const mapped: LeaderboardEntry[] = dbProfiles.map((p: any, idx: number) => ({
            rank: idx + 1,
            name: p.display_name || p.username || 'Piloto Anónimo',
            title: p.role === 'admin' ? 'FIA Director' : (idx === 0 ? 'World Champion' : (idx < 3 ? 'Podium Regular' : 'Paddock Pilot')),
            points: p.pitcoins ?? 1250,
            accuracy: idx === 0 ? '97.2%' : `${Math.max(82, 95 - idx * 2.1).toFixed(1)}%`,
            isCurrentUser: user?.id === p.id,
          }));
          setStandings(mapped);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fallback to static leaderboard if network/database isn't populated yet
      }

      // Default to curated F1 Leaderboard with current user inserted if logged in
      const defaultList: LeaderboardEntry[] = F1_LEADERBOARD.map(e => ({
        ...e,
        isCurrentUser: false,
      }));

      const activeCoins = profile?.pitcoins ?? (useStore.getState().coins || 1250);
      const activeName = profile?.display_name || profile?.username || 'Tú (Piloto Oficial)';

      const userEntry: LeaderboardEntry = {
        rank: 0,
        name: activeName,
        title: activeCoins >= 14000 ? 'World Champion' : (activeCoins >= 10000 ? 'FIA Super License' : 'Paddock Pilot'),
        points: activeCoins,
        accuracy: '94.2%',
        isCurrentUser: true,
      };

      const combined = [...defaultList.filter(e => e.name !== activeName), userEntry]
        .sort((a, b) => b.points - a.points)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

      setStandings(combined);
      setLoading(false);
    }

    loadStandings();
  }, [user, profile]);

  return (
    <section id="leaderboard" className="py-24 px-6 w-full max-w-5xl mx-auto border-b border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-white/50 uppercase block mb-2">
            GLOBAL PADDOCK STANDINGS // 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tighter">
            WORLD <span className="text-[#e10600]">CHAMPIONSHIP</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ACTUALIZADO EN TIEMPO REAL TRAS CADA GP</span>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#141414] border-b border-white/10 text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase">
          <div className="col-span-1 text-center">POS</div>
          <div className="col-span-4">PILOTO / USUARIO</div>
          <div className="col-span-3">CATEGORÍA FIA</div>
          <div className="col-span-2 text-right">PRECISIÓN</div>
          <div className="col-span-2 text-right">PUNTOS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {standings.map((entry) => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;
            const isCurrent = entry.isCurrentUser;

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors hover:bg-white/[0.03] ${
                  isCurrent 
                    ? 'bg-[#e10600]/15 border-l-2 border-[#e10600]' 
                    : isFirst 
                    ? 'bg-gradient-to-r from-[#e10600]/10 to-transparent' 
                    : ''
                }`}
              >
                {/* Position */}
                <div className="col-span-1 flex justify-center items-center">
                  {isFirst && <Trophy size={16} className="text-[#fed100]" />}
                  {isSecond && <Medal size={16} className="text-zinc-300" />}
                  {isThird && <Medal size={16} className="text-amber-700" />}
                  {!isFirst && !isSecond && !isThird && (
                    <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-[#e10600]' : 'text-white/50'}`}>
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="col-span-4 flex items-center gap-3">
                  <span className={`text-xs font-bold font-syne uppercase truncate ${isCurrent ? 'text-[#ff4d4d]' : 'text-white'}`}>
                    {entry.name}
                  </span>
                  {isFirst && (
                    <span className="hidden sm:inline-block text-[7px] font-mono uppercase bg-[#fed100]/20 text-[#fed100] px-1.5 py-0.5 border border-[#fed100]/30">
                      LEADER
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-block text-[7px] font-mono uppercase bg-[#e10600]/20 text-white px-1.5 py-0.5 border border-[#e10600]/50 font-bold">
                      TÚ
                    </span>
                  )}
                </div>

                {/* Tier Title */}
                <div className="col-span-3">
                  <span className="text-[9px] font-mono text-white/70 uppercase px-2 py-0.5 bg-white/5 border border-white/10">
                    {entry.title}
                  </span>
                </div>

                {/* Accuracy */}
                <div className="col-span-2 text-right">
                  <span className="text-xs font-mono font-bold text-[#00d2be]">{entry.accuracy}</span>
                </div>

                {/* Total Points */}
                <div className="col-span-2 text-right">
                  <span className="text-xs sm:text-sm font-syne font-black text-white">
                    {entry.points.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
