import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flag, RefreshCw, Radio, CheckCircle, AlertTriangle, Shield, Gauge } from 'lucide-react';
import { openf1, OpenF1ChampionshipDriver, OpenF1ChampionshipTeam, OpenF1RaceResult, OpenF1Session } from '../../lib/openf1Service';
import { TeamBadge } from './TeamBadge';
import { getTeamMeta } from '../../lib/teamData';
import { F1CarIcon, ChequeredFlagIcon } from '../common/F1Icons';

export const RealF1Hub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams' | 'results'>('drivers');
  const [driverStandings, setDriverStandings] = useState<OpenF1ChampionshipDriver[]>([]);
  const [teamStandings, setTeamStandings] = useState<OpenF1ChampionshipTeam[]>([]);
  const [raceResults, setRaceResults] = useState<OpenF1RaceResult[]>([]);
  const [session, setSession] = useState<OpenF1Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [drivers, teams, results, sess] = await Promise.all([
        openf1.getDriverStandings(),
        openf1.getTeamStandings(),
        openf1.getLatestRaceResults(),
        openf1.getLatestSession(),
      ]);

      setDriverStandings(drivers);
      setTeamStandings(teams);
      setRaceResults(results);
      setSession(sess);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error loading OpenF1 live data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section id="f1-real" className="py-24 px-6 w-full max-w-7xl mx-auto border-b border-white/5">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/30 flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse text-emerald-400" />
              OPENF1 LIVE DATA FEED // OFICIAL FIA
            </span>
            {session && (
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase px-2.5 py-1 bg-white/5 border border-white/10">
                {session.circuit_short_name} • {session.country_name}
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tighter">
            F1 <span className="text-[#e10600]">REAL</span> TELEMETRY
          </h2>
        </div>

        {/* Action Controls & Refresh */}
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-[8px] font-mono text-white/40 uppercase hidden sm:inline">
              SINCRONIZADO: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span>{loading ? 'Actualizando...' : 'Recargar Datos'}</span>
          </button>
        </div>
      </div>

      {/* Grand Prix Banner */}
      {session && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#121212] via-[#0d0d0d] to-[#0a0a0a] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[8px] font-mono tracking-[0.3em] text-[#e10600] uppercase block mb-1">
              ÚLTIMO GRAN PREMIO REGISTRADO ({session.year})
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-syne uppercase text-white">
              {session.session_name} • {session.location} ({session.country_name})
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-white/40 uppercase block">FECHA DE SESIÓN</span>
            <span className="text-xs font-mono font-bold text-white">
              {new Date(session.date_start).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-6 py-3 font-mono text-[9px] uppercase tracking-[0.25em] font-bold transition-all border flex items-center justify-center gap-2 ${
            activeTab === 'drivers'
              ? 'bg-white text-black border-white'
              : 'bg-[#121212] text-white/60 border-white/10 hover:text-white hover:border-white/30'
          }`}
        >
          <Trophy size={13} />
          <span>Mundial de Pilotos (Puntos)</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-6 py-3 font-mono text-[9px] uppercase tracking-[0.25em] font-bold transition-all border flex items-center justify-center gap-2 ${
            activeTab === 'teams'
              ? 'bg-white text-black border-white'
              : 'bg-[#121212] text-white/60 border-white/10 hover:text-white hover:border-white/30'
          }`}
        >
          <F1CarIcon size={14} />
          <span>Mundial de Constructores</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-6 py-3 font-mono text-[9px] uppercase tracking-[0.25em] font-bold transition-all border flex items-center justify-center gap-2 ${
            activeTab === 'results'
              ? 'bg-white text-black border-white'
              : 'bg-[#121212] text-white/60 border-white/10 hover:text-white hover:border-white/30'
          }`}
        >
          <ChequeredFlagIcon size={13} />
          <span>Resultados Último GP</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#e10600] rounded-full animate-spin mb-4" />
            <span className="text-[9px] font-mono tracking-[0.3em] text-white/50 uppercase">
              CONECTANDO CON OPENF1 API...
            </span>
          </div>
        ) : (
          <>
            {/* 1. DRIVERS CHAMPIONSHIP TAB */}
            {activeTab === 'drivers' && (
              <div>
                <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#141414] border-b border-white/10 text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-6 sm:col-span-5">PILOTO & ESCUDERÍA</div>
                  <div className="col-span-2 hidden sm:block text-center">PAÍS</div>
                  <div className="col-span-2 text-right">PREVIO</div>
                  <div className="col-span-3 sm:col-span-2 text-right">PUNTOS ACTUALES</div>
                </div>

                <div className="divide-y divide-white/5">
                  {driverStandings.map((item) => {
                    const isP1 = item.position_current === 1;
                    const isP2 = item.position_current === 2;
                    const isP3 = item.position_current === 3;
                    const delta = item.points_current - item.points_start;

                    return (
                      <div
                        key={item.driver_number}
                        className={`grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-white/[0.03] transition-colors ${
                          isP1 ? 'bg-gradient-to-r from-[#fed100]/10 to-transparent' : ''
                        }`}
                      >
                        {/* Pos */}
                        <div className="col-span-1 flex justify-center items-center">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                              isP1
                                ? 'bg-[#fed100] text-black shadow-lg shadow-[#fed100]/30'
                                : isP2
                                ? 'bg-zinc-300 text-black'
                                : isP3
                                ? 'bg-amber-700 text-white'
                                : 'text-white/50'
                            }`}
                          >
                            {item.position_current}
                          </span>
                        </div>

                        {/* Driver info */}
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                          {/* Driver Headshot if available */}
                          {item.driver?.headshot_url ? (
                            <img
                              src={item.driver.headshot_url}
                              alt={item.driver.full_name}
                              className="w-8 h-8 rounded-full object-cover bg-[#161616] border border-white/10"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white/40">
                              #{item.driver_number}
                            </div>
                          )}

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-syne text-white">
                                <span className="font-normal text-white/70">{item.driver?.first_name} </span>
                                <span className="font-black uppercase text-white">{item.driver?.last_name}</span>
                              </span>
                              <span className="text-[8px] font-mono text-white/30">
                                #{item.driver_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <TeamBadge teamName={item.driver?.team_name || ''} size="sm" />
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getTeamMeta(item.driver?.team_name).color }}
                              />
                              <span className="text-[9px] font-mono text-white/50 uppercase">
                                {getTeamMeta(item.driver?.team_name).shortName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Country */}
                        <div className="col-span-2 hidden sm:flex justify-center items-center">
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-white/60 uppercase">
                            {item.driver?.country_code || 'F1'}
                          </span>
                        </div>

                        {/* Prev points */}
                        <div className="col-span-2 text-right">
                          <span className="text-xs font-mono text-white/30">
                            {item.points_start}
                          </span>
                        </div>

                        {/* Current Points */}
                        <div className="col-span-3 sm:col-span-2 text-right flex flex-col items-end">
                          <span className="text-sm sm:text-base font-black font-syne text-white">
                            {item.points_current} <span className="text-[8px] font-mono text-white/40 font-normal">PTS</span>
                          </span>
                          {delta > 0 && (
                            <span className="text-[8px] font-mono text-emerald-400">
                              +{delta} en última carrera
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. TEAMS CHAMPIONSHIP TAB */}
            {activeTab === 'teams' && (
              <div>
                <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#141414] border-b border-white/10 text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-7 sm:col-span-6">ESCUDERÍA / CONSTRUCTOR</div>
                  <div className="col-span-2 text-right hidden sm:block">PREVIO</div>
                  <div className="col-span-4 sm:col-span-3 text-right">PUNTOS TOTALES</div>
                </div>

                <div className="divide-y divide-white/5">
                  {teamStandings.map((team) => {
                    const isP1 = team.position_current === 1;
                    const isP2 = team.position_current === 2;
                    const isP3 = team.position_current === 3;
                    const maxPoints = teamStandings[0]?.points_current || 600;
                    const pct = Math.max(4, Math.round((team.points_current / maxPoints) * 100));
                    const teamMeta = getTeamMeta(team.team_name);
                    const delta = team.points_current - team.points_start;

                    return (
                      <div
                        key={team.team_name}
                        className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center transition-all ${
                          isP1 ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent' : 'hover:bg-white/[0.02]'
                        }`}
                        style={{
                          borderLeft: `3px solid ${teamMeta.color}`,
                        }}
                      >
                        {/* Position */}
                        <div className="col-span-1 flex justify-center items-center">
                          <span
                            className={`w-6 h-6 rounded-xs flex items-center justify-center font-mono font-bold text-xs ${
                              isP1
                                ? 'bg-[#fed100] text-black shadow-md shadow-[#fed100]/30'
                                : isP2
                                ? 'bg-zinc-300 text-black'
                                : isP3
                                ? 'bg-amber-700 text-white'
                                : 'text-white/50'
                            }`}
                          >
                            {team.position_current}
                          </span>
                        </div>

                        {/* Team Logo, Name & Glowing Progress Bar */}
                        <div className="col-span-7 sm:col-span-6 flex items-center gap-3 sm:gap-4 pr-2 sm:pr-4">
                          <TeamBadge teamName={team.team_name} size="md" />

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-f1 font-bold uppercase text-white truncate tracking-wide">
                                {teamMeta.shortName}
                              </span>
                              <span
                                className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs text-black uppercase shadow-xs"
                                style={{ backgroundColor: teamMeta.color }}
                              >
                                {teamMeta.code}
                              </span>
                              <span className="text-[8px] font-mono text-white/40 hidden md:inline truncate">
                                • {teamMeta.engine}
                              </span>
                            </div>

                            {/* Team Liveried Progress Bar */}
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/5">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${teamMeta.color} 0%, ${teamMeta.secondaryColor} 100%)`,
                                  boxShadow: `0 0 10px ${teamMeta.color}80`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Previous points */}
                        <div className="col-span-2 text-right hidden sm:block">
                          <span className="text-xs font-mono text-white/30">
                            {team.points_start}
                          </span>
                        </div>

                        {/* Current Points & Delta */}
                        <div className="col-span-4 sm:col-span-3 text-right flex flex-col items-end">
                          <span className="text-sm sm:text-base font-f1 font-bold text-white">
                            {team.points_current} <span className="text-[8px] font-mono text-white/40 font-normal">PTS</span>
                          </span>
                          {delta > 0 && (
                            <span className="text-[8px] font-mono text-emerald-400 font-bold">
                              +{delta} pts GP
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. LAST RACE RESULTS TAB */}
            {activeTab === 'results' && (
              <div>
                <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#141414] border-b border-white/10 text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-5 sm:col-span-5">PILOTO</div>
                  <div className="col-span-2 text-center">VUELTAS</div>
                  <div className="col-span-2 text-right">DIFERENCIA</div>
                  <div className="col-span-2 text-right">PUNTOS GP</div>
                </div>

                <div className="divide-y divide-white/5">
                  {raceResults.map((r, i) => {
                    return (
                      <div
                        key={r.driver_number + i}
                        className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Position */}
                        <div className="col-span-1 flex justify-center items-center">
                          {r.dnf ? (
                            <span className="text-[8px] font-mono text-[#e10600] font-bold px-1.5 py-0.5 bg-red-950/40 border border-red-500/20">
                              DNF
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-xs text-white">
                              {r.position || '-'}
                            </span>
                          )}
                        </div>

                        {/* Pilot & Team */}
                        <div className="col-span-5 sm:col-span-5 flex items-center gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-syne text-white truncate">
                                <span className="font-normal text-white/70">{r.driver?.first_name} </span>
                                <span className="font-black uppercase text-white">{r.driver?.last_name}</span>
                              </span>
                              <span className="text-[8px] font-mono text-white/30">
                                #{r.driver_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <TeamBadge teamName={r.driver?.team_name || ''} size="sm" />
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getTeamMeta(r.driver?.team_name).color }}
                              />
                              <span className="text-[8px] font-mono text-white/50 uppercase">
                                {getTeamMeta(r.driver?.team_name).shortName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Laps */}
                        <div className="col-span-2 text-center">
                          <span className="text-xs font-mono text-white/60">
                            {r.number_of_laps}
                          </span>
                        </div>

                        {/* Gap */}
                        <div className="col-span-2 text-right">
                          <span
                            className={`text-[9px] font-mono ${
                              r.gap_to_leader === 'WINNER'
                                ? 'text-[#fed100] font-bold'
                                : r.gap_to_leader.includes('LAP')
                                ? 'text-white/30'
                                : 'text-white/70'
                            }`}
                          >
                            {r.gap_to_leader}
                          </span>
                        </div>

                        {/* Points Awarded */}
                        <div className="col-span-2 text-right">
                          <span
                            className={`text-xs sm:text-sm font-syne font-black ${
                              r.points > 0 ? 'text-emerald-400' : 'text-white/20'
                            }`}
                          >
                            {r.points > 0 ? `+${r.points}` : '0'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
