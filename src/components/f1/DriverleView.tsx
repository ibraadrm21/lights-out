import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trophy, AlertCircle, RefreshCw, ArrowUp, ArrowDown, Check, 
  Share2, Calendar, Flame, SlidersHorizontal, KeyRound, Award, Sparkles 
} from 'lucide-react';
import { DriverleEngine } from '../../lib/lightsout/driverle-engine.js';
import { F1_DRIVERS } from '../../lib/lightsout/data.js';
import { useStore } from '../../store/useStore';
import { getTeamMeta } from '../../lib/teamData';

type EraFilter = 'all' | 'hybrid' | 'modern' | 'winners';

export const DriverleView: React.FC = () => {
  const [gameMode, setGameMode] = useState<'daily' | 'infinite'>('infinite');
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');
  
  const getFilterOptions = (era: EraFilter, mode: 'daily' | 'infinite') => {
    switch (era) {
      case 'hybrid':
        return { minYear: 2014, maxYear: 2026, gameMode: mode };
      case 'modern':
        return { minYear: 2000, maxYear: 2026, gameMode: mode };
      case 'winners':
        return { minYear: 1950, maxYear: 2026, statMode: 'wins', gameMode: mode };
      case 'all':
      default:
        return { minYear: 1950, maxYear: 2026, gameMode: mode };
    }
  };

  const [engine, setEngine] = useState(() => new DriverleEngine(getFilterOptions(eraFilter, gameMode)));
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [playerStats, setPlayerStats] = useState(() => DriverleEngine.getPlayerStats());

  const { addCoins } = useStore();

  // Reset or reconfigure engine when mode or era changes
  const handleConfigChange = (newMode: 'daily' | 'infinite', newEra: EraFilter) => {
    setGameMode(newMode);
    setEraFilter(newEra);
    const newEng = new DriverleEngine(getFilterOptions(newEra, newMode));
    setEngine(newEng);
    setAttempts([]);
    setInputValue('');
    setSuggestions([]);
    setIsGameOver(false);
    setIsVictory(false);
    setShareCopied(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length >= 1) {
      const q = val.toLowerCase();
      const filtered = F1_DRIVERS.filter(
        (d: any) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          (d.team && d.team.toLowerCase().includes(q))
      ).slice(0, 7);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectDriver = (driver: any) => {
    setInputValue(driver.name);
    setSuggestions([]);
    submitDriver(driver.id);
  };

  const submitDriver = (driverId: string) => {
    if (isGameOver) return;
    const res = engine.submitGuess(driverId);
    if (res.error) {
      alert(res.error);
      return;
    }

    setAttempts([...engine.attempts]);
    setInputValue('');
    setSuggestions([]);

    if (res.isVictory) {
      setIsVictory(true);
      setIsGameOver(true);
      
      // Dynamic rewards: earlier guesses yield more coins
      const attemptBonus = Math.max(100, 500 - (engine.attempts.length - 1) * 45);
      addCoins(attemptBonus);
      setPlayerStats(DriverleEngine.getPlayerStats());
    } else if (res.isGameOver) {
      setIsGameOver(true);
      setPlayerStats(DriverleEngine.getPlayerStats());
    }
  };

  const handleReset = () => {
    const newEngine = new DriverleEngine(getFilterOptions(eraFilter, gameMode));
    setEngine(newEngine);
    setAttempts([]);
    setInputValue('');
    setSuggestions([]);
    setIsGameOver(false);
    setIsVictory(false);
    setShareCopied(false);
  };

  const handleShare = () => {
    const shareText = engine.generateShareText();
    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const unlockedHints = engine.getUnlockedHints();

  const renderCell = (data: { val: number | string; match: boolean; direction: string }, label: string) => {
    return (
      <div
        className={`p-2 flex flex-col justify-center items-center rounded-xs transition-all ${
          data.match
            ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20'
            : data.direction === 'higher'
            ? 'bg-amber-950/40 border border-amber-500/30 text-amber-200'
            : data.direction === 'lower'
            ? 'bg-blue-950/40 border border-blue-500/30 text-blue-200'
            : 'bg-[#151515] border border-white/10 text-white/70'
        }`}
      >
        <span className="text-[7px] font-mono text-white/30 uppercase">{label}</span>
        <div className="flex items-center gap-1 font-mono font-black text-xs mt-0.5">
          <span>{data.val}</span>
          {!data.match && data.direction === 'higher' && (
            <ArrowUp size={12} className="text-[#fed100] stroke-[3] animate-pulse" />
          )}
          {!data.match && data.direction === 'lower' && (
            <ArrowDown size={12} className="text-cyan-400 stroke-[3] animate-pulse" />
          )}
          {data.match && <Check size={12} className="text-emerald-400 stroke-[3.5]" />}
        </div>
      </div>
    );
  };

  return (
    <section id="driverle" className="py-24 px-4 sm:px-6 w-full max-w-6xl mx-auto border-b border-white/5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-[#00d2be] uppercase bg-[#00d2be]/10 px-2.5 py-1 border border-[#00d2be]/30 flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#00d2be]" />
              F1 DRIVERLE ENGINE // LIGHTS OUT
            </span>
            <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase px-2 py-0.5 bg-white/5 border border-white/10">
              INTENTOS: {attempts.length} / {engine.maxAttempts}
            </span>
            {gameMode === 'daily' && (
              <span className="text-[9px] font-mono tracking-widest text-[#fed100] uppercase px-2 py-0.5 bg-[#fed100]/10 border border-[#fed100]/30 flex items-center gap-1">
                <Calendar size={10} /> DESAFÍO DIARIO
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tighter">
            DRIVER<span className="text-[#e10600]">LE</span>
          </h2>
        </div>

        {/* Player Stats Mini Widget */}
        <div className="flex items-center gap-3 bg-[#111111] border border-white/10 px-4 py-2 rounded-xs">
          <div className="text-right">
            <span className="text-[7px] font-mono text-white/40 uppercase block">RACHA ACTUAL</span>
            <span className="text-sm font-mono font-bold text-white flex items-center gap-1 justify-end">
              <Flame size={13} className="text-orange-500 fill-orange-500" />
              {playerStats.streak || 0}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="text-right">
            <span className="text-[7px] font-mono text-white/40 uppercase block">VICTORIAS</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {playerStats.won || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Mode & Era Filters Toolbar */}
      <div className="mb-6 p-3 bg-[#0d0d0d] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Game Mode: Daily vs Infinite */}
        <div className="flex items-center gap-1 bg-black p-1 border border-white/10">
          <button
            type="button"
            onClick={() => handleConfigChange('infinite', eraFilter)}
            className={`px-3 py-1.5 text-[8px] font-mono font-bold tracking-widest uppercase transition-all ${
              gameMode === 'infinite' ? 'bg-[#00d2be] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Modo Infinito
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange('daily', eraFilter)}
            className={`px-3 py-1.5 text-[8px] font-mono font-bold tracking-widest uppercase transition-all ${
              gameMode === 'daily' ? 'bg-[#fed100] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Piloto Diario
          </button>
        </div>

        {/* Era Presets */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          <span className="text-[8px] font-mono text-white/30 uppercase mr-1 hidden sm:inline">
            FILTRO ÉPOCA:
          </span>
          <button
            type="button"
            onClick={() => handleConfigChange(gameMode, 'all')}
            className={`px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider rounded-xs transition-all ${
              eraFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            1950 - 2026
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange(gameMode, 'hybrid')}
            className={`px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider rounded-xs transition-all ${
              eraFilter === 'hybrid' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Híbrida (2014-26)
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange(gameMode, 'modern')}
            className={`px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider rounded-xs transition-all ${
              eraFilter === 'modern' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            2000 - 2026
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange(gameMode, 'winners')}
            className={`px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider rounded-xs transition-all ${
              eraFilter === 'winners' ? 'bg-[#fed100]/20 text-[#fed100] font-bold border border-[#fed100]/30' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Solo Ganadores GP
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-10 relative shadow-2xl">
        {/* Dynamic Telemetry Hints Bar (Unlocked progressively) */}
        {!isGameOver && (
          <div className="mb-8 p-4 bg-[#121212] border border-white/10 rounded-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-mono font-bold tracking-widest text-white/50 uppercase flex items-center gap-1.5">
                <KeyRound size={11} className="text-[#fed100]" />
                PISTAS DE TELEMETRÍA (SE DESBLOQUEAN A LOS 3, 6 Y 8 INTENTOS):
              </span>
              <span className="text-[8px] font-mono text-white/30 uppercase">
                {unlockedHints.length} / 3 DESBLOQUEADAS
              </span>
            </div>

            {unlockedHints.length === 0 ? (
              <p className="text-xs text-white/40 font-mono italic">
                Ninguna pista desbloqueada aún. Introduce pilotos para descifrar datos confidenciales.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {unlockedHints.map((h: any) => (
                  <div key={h.id} className="p-2.5 bg-black/60 border border-white/10 rounded-xs">
                    <span className="text-[7px] font-mono text-white/40 uppercase block mb-0.5">
                      {h.label}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: h.color }}>
                      ⚡ {h.val}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Autocomplete Input */}
        {!isGameOver && (
          <div className="relative mb-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Escribe el nombre del piloto (ej: Alonso, Senna, Hamilton, Schumacher, Piastri)..."
                className="w-full bg-[#121212] border border-white/20 px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors uppercase font-mono tracking-wider"
                autoComplete="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 flex items-center gap-1">
                <Search size={12} /> F1 ARCHIVE
              </span>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-white/20 shadow-2xl z-40 max-h-64 overflow-y-auto divide-y divide-white/5">
                {suggestions.map((driver: any) => (
                  <button
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-f1 font-bold text-white uppercase group-hover:text-emerald-400 transition-colors">
                        {driver.name}
                      </span>
                      <span className="text-[8px] font-mono text-white/40 block mt-0.5">
                        {driver.country} • {driver.team}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-white/30 uppercase px-2 py-0.5 bg-white/5 border border-white/10">
                      {driver.debutYear} - {driver.lastYear || 'PRESENTE'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Win / Game Over Profile Showcase Card */}
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 mb-8 border border-white/15 bg-gradient-to-r from-[#141414] via-[#101010] to-[#0d0d0d] rounded-xs shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xs shadow-xl ${
                    isVictory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-[#e10600] border border-red-500/40'
                  }`}
                >
                  {isVictory ? <Trophy size={28} /> : <AlertCircle size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase ${isVictory ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isVictory ? `¡ACERTADO EN ${attempts.length} INTENTOS!` : 'DESAFÍO COMPLETADO'}
                    </span>
                    <span className="text-[8px] font-mono text-white/40">
                      CÓDIGO: {engine.targetDriver.code || 'F1'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-f1 font-black text-white uppercase tracking-tight">
                    {engine.targetDriver.name}
                  </h3>
                  <span className="text-xs font-mono text-white/60">
                    {engine.targetDriver.country} • {engine.targetDriver.team} ({engine.targetDriver.debutYear} - {engine.targetDriver.lastYear || 'PRESENTE'})
                  </span>
                </div>
              </div>

              {/* Action Buttons: Next Game + Share Result */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-[#181818] hover:bg-[#222222] border border-white/20 text-white font-mono text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={12} className="text-[#fed100]" />
                  <span>{shareCopied ? '¡COPIADO!' : 'COMPARTIR'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-white hover:bg-neutral-200 text-black font-f1 font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <RefreshCw size={12} />
                  <span>SIGUIENTE PILOTO</span>
                </button>
              </div>
            </div>

            {/* Target Driver Technical Telemetry Dossier */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3 bg-white/[0.02] border border-white/5">
                <span className="text-[7px] font-mono text-white/30 uppercase block">MUNDIALES</span>
                <span className="text-base font-f1 font-bold text-[#fed100]">{engine.targetDriver.championships} WCs</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5">
                <span className="text-[7px] font-mono text-white/30 uppercase block">VICTORIAS GP</span>
                <span className="text-base font-f1 font-bold text-white">{engine.targetDriver.wins} WINS</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5">
                <span className="text-[7px] font-mono text-white/30 uppercase block">PODIOS OFICIALES</span>
                <span className="text-base font-f1 font-bold text-white">{engine.targetDriver.podiums} TOP 3s</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5">
                <span className="text-[7px] font-mono text-white/30 uppercase block">PUNTOS EN F1</span>
                <span className="text-base font-f1 font-bold text-emerald-400">{engine.targetDriver.points?.toLocaleString()} PTS</span>
              </div>
            </div>

            {engine.targetDriver.quote && (
              <div className="mt-4 p-3 bg-white/[0.03] border-l-2 border-[#e10600] text-xs font-mono text-white/70 italic">
                "{engine.targetDriver.quote}"
              </div>
            )}
          </motion.div>
        )}

        {/* Guess Comparison Table Header */}
        {attempts.length > 0 && (
          <div className="hidden sm:grid grid-cols-9 gap-1.5 px-2 pb-2 text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest text-center border-b border-white/10 mb-3">
            <div className="text-left pl-2">PILOTO</div>
            <div>DEBUT</div>
            <div>RETIRO</div>
            <div>MUNDIALES</div>
            <div>VICTORIAS</div>
            <div>PODIOS</div>
            <div>PUNTOS</div>
            <div>POLES</div>
            <div>GPS</div>
          </div>
        )}

        {/* Attempts Comparison Stack */}
        <div className="space-y-2">
          {attempts.map((comp: any, idx: number) => {
            return (
              <motion.div
                key={comp.driver.id + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 p-2 bg-[#0e0e0e] border border-white/10 text-center rounded-xs"
              >
                {/* Driver Name Column */}
                <div
                  className={`col-span-3 sm:col-span-1 p-2 flex flex-col justify-center items-start pl-3 rounded-xs text-left ${
                    comp.nameMatch
                      ? 'bg-emerald-950/80 border border-emerald-400 shadow-sm shadow-emerald-500/20'
                      : 'bg-[#151515] border border-white/10'
                  }`}
                >
                  <span className="font-f1 font-bold text-xs uppercase text-white truncate w-full">
                    {comp.driver.name}
                  </span>
                  <span className="text-[8px] font-mono text-white/40 truncate w-full">
                    {comp.driver.country}
                  </span>
                </div>

                {renderCell(comp.firstYear, 'DEBUT')}
                {renderCell(comp.lastYear, 'RETIRO')}
                {renderCell(comp.wcs, 'TITULOS')}
                {renderCell(comp.wins, 'WINS')}
                {renderCell(comp.top3s, 'PODIOS')}
                {renderCell(comp.points, 'PUNTOS')}
                {renderCell(comp.poles, 'POLES')}
                {renderCell(comp.gps, 'GPS')}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
