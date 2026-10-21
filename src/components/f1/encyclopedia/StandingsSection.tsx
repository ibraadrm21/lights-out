import React, { useState } from 'react';
import { Trophy, ArrowLeftRight, Activity, Flag, ChevronRight, User } from 'lucide-react';
import { 
  F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_TEAMMATE_DUELS, 
  getDriverById, getConstructorById 
} from '../../../data/f1EncyclopediaData';
import { SelectedEntity } from './EntityDetailModal';

interface StandingsSectionProps {
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const StandingsSection: React.FC<StandingsSectionProps> = ({
  onSelectEntity,
}) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams' | 'duels'>('drivers');

  const sortedDrivers = [...F1_DRIVERS_DATA].sort((a, b) => a.championshipPosition - b.championshipPosition);
  const sortedTeams = [...F1_CONSTRUCTORS_DATA].sort((a, b) => a.championshipPosition - b.championshipPosition);

  return (
    <div className="space-y-8">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border ${
            activeTab === 'drivers'
              ? 'bg-[#e10600] text-white font-bold border-[#e10600]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          Mundial de Pilotos
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border ${
            activeTab === 'teams'
              ? 'bg-[#e10600] text-white font-bold border-[#e10600]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          Mundial de Constructores
        </button>
        <button
          onClick={() => setActiveTab('duels')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'duels'
              ? 'bg-[#e10600] text-white font-bold border-[#e10600]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <ArrowLeftRight size={13} />
          <span>Duelos entre Compañeros</span>
        </button>
      </div>

      {/* 1. DRIVERS STANDINGS TABLE */}
      {activeTab === 'drivers' && (
        <div className="overflow-x-auto border border-white/10 bg-[#0d0d0d]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/5 text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Piloto</th>
                <th className="py-3 px-4">Escudería</th>
                <th className="py-3 px-4 text-center">Victorias</th>
                <th className="py-3 px-4 text-center">Podios</th>
                <th className="py-3 px-4 text-center">Poles</th>
                <th className="py-3 px-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedDrivers.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => onSelectEntity({ type: 'driver', data: d })}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs ${
                      d.championshipPosition === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black'
                        : d.championshipPosition <= 3
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-white/60'
                    }`}>
                      {d.championshipPosition}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{d.flag}</span>
                      <span className="font-bold text-white group-hover:text-[#e10600] transition-colors">
                        {d.fullName}
                      </span>
                      <span className="text-[10px] text-white/40">#{d.number}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.teamColour }} />
                      <span>{d.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white">
                    {d.seasonStats.wins > 0 ? d.seasonStats.wins : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-white/80">
                    {d.seasonStats.podiums > 0 ? d.seasonStats.podiums : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-amber-400 font-bold">
                    {d.seasonStats.poles > 0 ? d.seasonStats.poles : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-sm text-[#e10600]">
                    {d.points} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. CONSTRUCTORS STANDINGS TABLE */}
      {activeTab === 'teams' && (
        <div className="overflow-x-auto border border-white/10 bg-[#0d0d0d]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/5 text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Constructor</th>
                <th className="py-3 px-4">Motor</th>
                <th className="py-3 px-4 text-center">Victorias</th>
                <th className="py-3 px-4 text-center">Podios</th>
                <th className="py-3 px-4 text-center">Poles</th>
                <th className="py-3 px-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTeams.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onSelectEntity({ type: 'team', data: t })}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs ${
                      t.championshipPosition === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black'
                        : 'text-white/60'
                    }`}>
                      {t.championshipPosition}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <img src={t.logoUrl} alt={t.officialName} className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="font-bold text-white group-hover:text-[#e10600] transition-colors">
                        {t.officialName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-cyan-400">
                    {t.powerUnitDesignation}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white">
                    {t.seasonStats.wins > 0 ? t.seasonStats.wins : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-white/80">
                    {t.seasonStats.podiums > 0 ? t.seasonStats.podiums : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-amber-400 font-bold">
                    {t.seasonStats.poles > 0 ? t.seasonStats.poles : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-sm text-[#e10600]">
                    {t.points} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. TEAMMATE HEAD-TO-HEAD DUELS */}
      {activeTab === 'duels' && (
        <div className="space-y-6">
          <div className="p-4 bg-white/5 border border-white/10 text-xs font-mono text-white/70">
            Comparativa interna oficial entre pilotos titulares de cada escudería durante los 24 Grandes Premios de 2024.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {F1_TEAMMATE_DUELS.map((duel) => {
              const totalPoints = duel.driver1.points + duel.driver2.points || 1;
              const d1Pct = Math.round((duel.driver1.points / totalPoints) * 100);
              const d2Pct = 100 - d1Pct;

              return (
                <div
                  key={duel.teamId}
                  className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4"
                >
                  {/* Team Title */}
                  <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                    <h4 className="text-base font-black font-syne uppercase text-white tracking-tight">
                      {duel.teamName}
                    </h4>
                    <span className="text-[10px] font-mono text-white/40">
                      {duel.totalRacesCompared} GPS COMPARADOS
                    </span>
                  </div>

                  {/* Duel Metrics Table */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="text-left font-bold text-white">
                      <span className="text-sm block">{duel.driver1.name}</span>
                      <span className="text-[#e10600]">{duel.driver1.points} PTS</span>
                    </div>
                    <div className="text-white/40 text-[10px] uppercase flex flex-col justify-center">
                      <span>MÉTRICA</span>
                    </div>
                    <div className="text-right font-bold text-white">
                      <span className="text-sm block">{duel.driver2.name}</span>
                      <span className="text-[#e10600]">{duel.driver2.points} PTS</span>
                    </div>
                  </div>

                  {/* Head to Head Bars */}
                  <div className="space-y-2 text-xs font-mono">
                    {/* Qualifying Battle */}
                    <div className="p-2 bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{duel.driver1.qualifyingAhead}</span>
                      <span className="text-[9px] text-white/50 uppercase">SÁBADOS (CLASIFICACIÓN)</span>
                      <span className="font-bold text-white">{duel.driver2.qualifyingAhead}</span>
                    </div>

                    {/* Race Battle */}
                    <div className="p-2 bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{duel.driver1.racesAhead}</span>
                      <span className="text-[9px] text-white/50 uppercase">DOMINGOS (CARRERA)</span>
                      <span className="font-bold text-white">{duel.driver2.racesAhead}</span>
                    </div>

                    {/* Podiums */}
                    <div className="p-2 bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{duel.driver1.podiums}</span>
                      <span className="text-[9px] text-white/50 uppercase">PODIOS OBTENIDOS</span>
                      <span className="font-bold text-white">{duel.driver2.podiums}</span>
                    </div>
                  </div>

                  {/* Points Share Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-white/50">
                      <span>{d1Pct}% puntos equipo</span>
                      <span>{d2Pct}% puntos equipo</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 overflow-hidden flex">
                      <div className="h-full bg-[#e10600]" style={{ width: `${d1Pct}%` }} />
                      <div className="h-full bg-cyan-400" style={{ width: `${d2Pct}%` }} />
                    </div>
                  </div>

                  {/* Analysis */}
                  <p className="text-[11px] font-mono text-white/60 leading-relaxed pt-2 border-t border-white/5">
                    {duel.analysis}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
