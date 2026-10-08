import React from 'react';
import { motion } from 'motion/react';
import { SpotlightCard } from './motion-primitives.jsx';

export function LeaderboardView({ store, onReturnHome }) {
  const leaders = store.getLeaderboard();
  const top3 = leaders.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="clean-card p-6 sm:p-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-white/[0.06] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold text-[#ff1801] bg-[#ff1801]/10 border border-[#ff1801]/20 px-2.5 py-0.5 rounded uppercase">
              FIA Standings Oficial
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">Temporada 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight uppercase">
            Clasificación del Mundial
          </h2>
        </div>

        <button className="btn-clean-secondary !py-2 !px-3.5 text-xs font-semibold" onClick={onReturnHome}>
          &larr; Volver al Paddock
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {top3.map((podiumDriver, i) => {
          const colors = [
            { border: 'border-amber-400/50', label: '🥇 P1 CAMPEÓN', text: 'text-amber-400' },
            { border: 'border-slate-300/40', label: '🥈 P2 SUBCAMPEÓN', text: 'text-slate-300' },
            { border: 'border-amber-700/40', label: '🥉 P3 TERCERO', text: 'text-amber-600' },
          ][i];

          return (
            <SpotlightCard
              key={podiumDriver.id || i}
              className={`clean-card p-6 text-center border ${colors.border}`}
            >
              <span className={`text-[11px] font-mono font-bold tracking-wider ${colors.text}`}>
                {colors.label}
              </span>
              <div className="text-4xl my-3">{podiumDriver.avatar}</div>
              <div className="text-lg font-bold uppercase text-white font-['Space_Grotesk']">
                {podiumDriver.name}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 mb-4">
                {podiumDriver.country} {podiumDriver.badge}
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {podiumDriver.points.toLocaleString()} PTS
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0f18]/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-16">POS</th>
              <th className="py-3 px-4">PILOTO / LICENCIA</th>
              <th className="py-3 px-4 text-center">PAÍS</th>
              <th className="py-3 px-4 text-center">INSIGNIA</th>
              <th className="py-3 px-4 text-right">SUPERLICENCIA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {leaders.map((l) => (
              <tr
                key={l.id}
                className={`transition-colors ${
                  l.isSelf ? 'bg-[#ff1801]/10 font-semibold' : 'hover:bg-white/[0.02]'
                }`}
              >
                <td className="py-3 px-4 text-center font-bold font-['Space_Grotesk'] text-base">
                  {l.rank === 1 ? '🥇' : l.rank === 2 ? '🥈' : l.rank === 3 ? '🥉' : l.rank}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-lg">
                      {l.avatar}
                    </span>
                    <div>
                      <div className="text-white font-['Space_Grotesk'] font-medium">
                        {l.name} {l.isSelf && <span className="text-[#ff1801] text-xs font-mono font-bold ml-1.5">(TÚ)</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{l.rankName}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-base">{l.country}</td>
                <td className="py-3 px-4 text-center text-base">{l.badge}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                  {l.points.toLocaleString()} PTS
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
