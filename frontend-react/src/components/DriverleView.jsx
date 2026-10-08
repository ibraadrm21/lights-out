import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { DriverleEngine } from '../driverle-engine.js';
import { F1_DRIVERS } from '../data.js';
import { SpotlightCard } from './motion-primitives.jsx';

export function DriverleView({ store, updateNavTelemetry, onReturnHome }) {
  const [engine, setEngine] = useState(() => new DriverleEngine({ gameMode: 'infinite' }));
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [minYear, setMinYear] = useState(1950);
  const [maxYear, setMaxYear] = useState(2026);
  const [statMode, setStatMode] = useState('all');

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length >= 2) {
      const q = val.toLowerCase();
      const filtered = F1_DRIVERS.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.team.toLowerCase().includes(q)
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectDriver = (driver) => {
    setInputValue(driver.name);
    setSuggestions([]);
    submitDriver(driver.id);
  };

  const submitDriver = (driverId) => {
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
      store.addPointsAndCoins(300, 80, `Driverle: ${engine.targetDriver.name}`);
      updateNavTelemetry();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#ff1801', '#ffffff'],
        });
      } catch (e) {}
    } else if (res.isGameOver) {
      setIsGameOver(true);
    }
  };

  const handleReset = (opts = {}) => {
    const newEngine = new DriverleEngine({
      minYear,
      maxYear,
      statMode,
      gameMode: 'infinite',
      ...opts,
    });
    setEngine(newEngine);
    setAttempts([]);
    setIsGameOver(false);
    setIsVictory(false);
    setInputValue('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="clean-card p-6 sm:p-10 max-w-5xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-white/[0.06] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded uppercase">
              Telemetría 6 Intentos
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">Modo Histórico F1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight uppercase">
            F1 Driverle
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-clean-secondary !py-2 !px-3.5 text-xs font-semibold"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            ⚙️ Filtros ({minYear}-{maxYear})
          </button>
          <button
            className="btn-clean-primary !py-2 !px-4 text-xs font-semibold"
            onClick={() => handleReset()}
          >
            Nuevo Piloto 🎲
          </button>
          <button
            className="btn-clean-secondary !py-2 !px-3 text-xs font-semibold"
            onClick={onReturnHome}
          >
            &larr; Paddock
          </button>
        </div>
      </div>

      {/* Filter drawer */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#121520] border border-white/[0.08] rounded-xl p-5 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Rango de Temporadas</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {minYear} &mdash; {maxYear}
              </span>
            </div>
            <div className="flex gap-4 items-center mb-4">
              <input
                type="range"
                min="1950"
                max="2026"
                value={minYear}
                onChange={(e) => setMinYear(parseInt(e.target.value, 10))}
                className="w-full accent-[#ff1801]"
              />
              <input
                type="range"
                min="1950"
                max="2026"
                value={maxYear}
                onChange={(e) => setMaxYear(parseInt(e.target.value, 10))}
                className="w-full accent-[#ff1801]"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {['all', 'points', 'wins'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    statMode === mode
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-white/[0.04] text-white border-white/[0.08]'
                  }`}
                >
                  {mode === 'all' ? 'Todos' : mode === 'points' ? 'Con Puntos' : 'Con Victorias'}
                </button>
              ))}
              <button
                className="btn-clean-primary !py-1.5 !px-3.5 text-xs font-semibold ml-auto"
                onClick={() => {
                  handleReset();
                  setSettingsOpen(false);
                }}
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Guess Input Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Escribe el nombre de un piloto de F1 (ej: Alonso, Verstappen, Senna, Hamilton)..."
          value={inputValue}
          onChange={handleInputChange}
          disabled={isGameOver}
          className="w-full bg-[#121520] border border-white/[0.12] rounded-xl px-4 py-3.5 text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#ff1801] transition-colors"
        />

        {/* Suggestions Autocomplete */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#141824] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl z-50">
            {suggestions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectDriver(s)}
                className="px-4 py-3 border-b border-white/[0.05] last:border-none flex justify-between items-center cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div>
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">{s.team} ({s.country})</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Debut: {s.debutYear}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telemetry Grid Header */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[1.6fr_repeat(8,1fr)] gap-2 mb-2">
            {['PILOTO', 'DEBUT', 'ÚLTIMO', 'TÍTULOS', 'VICTORIAS', 'PODIOS', 'PUNTOS', 'POLES', 'GPS'].map((h) => (
              <div
                key={h}
                className="bg-white/[0.06] text-slate-300 font-mono font-bold text-[11px] text-center py-2 px-1 rounded-md tracking-wider"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Attempts Rows */}
          <div className="flex flex-col gap-2 mb-6">
            {attempts.map((att, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-[1.6fr_repeat(8,1fr)] gap-2"
              >
                {/* Driver Name */}
                <div
                  className={`rounded-lg py-2.5 px-3 font-bold text-xs sm:text-sm flex items-center font-['Space_Grotesk'] text-white ${
                    att.nameMatch ? 'bg-emerald-600' : 'bg-white/[0.08]'
                  }`}
                >
                  {att.driver.name}
                </div>

                {/* Metric Cells */}
                {[
                  att.firstYear,
                  att.lastYear,
                  att.wcs,
                  att.wins,
                  att.top3s,
                  att.points,
                  att.poles,
                  att.gps,
                ].map((cell, cIdx) => {
                  const bgClass = cell.match
                    ? 'bg-emerald-600 text-white'
                    : cell.direction === 'higher'
                    ? 'bg-amber-600/90 text-white'
                    : 'bg-indigo-600/90 text-white';
                  const arrow = cell.match ? '' : cell.direction === 'higher' ? ' ↑' : ' ↓';

                  return (
                    <div
                      key={cIdx}
                      className={`rounded-lg py-2.5 px-1 text-center font-mono font-bold text-xs flex items-center justify-center ${bgClass}`}
                    >
                      {cell.val}
                      {arrow}
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Over Modal / Card */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-5 ${
              isVictory
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-[#ff1801]/10 border-[#ff1801]/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{isVictory ? '🏆' : '🛑'}</span>
              <div>
                <h4 className="text-lg font-bold font-['Space_Grotesk'] uppercase text-white">
                  {isVictory ? '¡Piloto Acertado con Éxito!' : 'Fin de los 6 Intentos'}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  El piloto misterioso era: <strong className="text-white">{engine.targetDriver.name}</strong> ({engine.targetDriver.team}) &bull; Debut {engine.targetDriver.debutYear} &bull; {engine.targetDriver.wcs} Títulos Mundiales.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleReset()}
              className="btn-clean-primary whitespace-nowrap"
            >
              Jugar de Nuevo 🎲
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs font-mono text-slate-500 flex justify-between items-center pt-2">
        <span>Intentos usados: {attempts.length} de 6</span>
        <span>Verde: Exacto | Naranja: Mayor ↑ | Azul: Menor ↓</span>
      </div>
    </motion.div>
  );
}
