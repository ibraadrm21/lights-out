import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, ArrowDown, Trophy, Flame, RotateCcw, 
  Share2, Shield, CheckCircle2, XCircle, Award 
} from 'lucide-react';
import { F1_DRIVERS } from '../../lib/lightsout/data.js';
import { useStore } from '../../store/useStore';
import { PitCoinIcon } from '../common/F1Icons';

type MetricKey = 'wins' | 'podiums' | 'championships' | 'poles' | 'gps' | 'points';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
}

const METRICS: MetricConfig[] = [
  { key: 'wins', label: 'VICTORIAS EN GRANDES PREMIOS', unit: 'victorias' },
  { key: 'podiums', label: 'PODIOS EN FÓRMULA 1', unit: 'podios' },
  { key: 'championships', label: 'TÍTULOS MUNDIALES (WDC)', unit: 'títulos' },
  { key: 'poles', label: 'POLE POSITIONS', unit: 'poles' },
  { key: 'gps', label: 'GRANDES PREMIOS DISPUTADOS', unit: 'GPs' },
  { key: 'points', label: 'PUNTOS HISTÓRICOS TOTALES', unit: 'puntos' }
];

export const HigherLowerGameView: React.FC = () => {
  // Pool of drivers: Between 1950 and 1999 only iconic legends (champions, multi-winners, podium icons).
  // From 2000 onwards, all drivers who took part in F1 are included.
  const eligibleDrivers = React.useMemo(() => {
    return F1_DRIVERS.filter((d: any) => {
      const isModern = (d.debutYear >= 2000 || (d.lastYear && d.lastYear >= 2000));
      if (isModern) {
        return d.gps >= 1; // From 2000 onwards, all drivers
      }
      // Between 1950 and 1999: Only legendary / mythical drivers
      return (d.championships > 0 || d.wins >= 2 || d.podiums >= 6);
    });
  }, []);

  const getRandomDriver = (excludeId?: string) => {
    const pool = excludeId ? eligibleDrivers.filter((d: any) => d.id !== excludeId) : eligibleDrivers;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Find the most relevant metric between two drivers where they actually differ significantly
  const getRelevantMetric = (d1: any, d2: any): MetricConfig => {
    // If either driver or both have World Championships, but they differ in titles, championships is huge
    const champDiff = Math.abs((d1.championships || 0) - (d2.championships || 0));
    const winDiff = Math.abs((d1.wins || 0) - (d2.wins || 0));
    const poleDiff = Math.abs((d1.poles || 0) - (d2.poles || 0));
    const podDiff = Math.abs((d1.podiums || 0) - (d2.podiums || 0));
    const gpDiff = Math.abs((d1.gps || 0) - (d2.gps || 0));
    const ptsDiff = Math.abs((d1.points || 0) - (d2.points || 0));

    // Candidates that have an interesting difference (non-zero)
    const candidates: { config: MetricConfig; weight: number }[] = [];

    // If both have equal WDC (e.g. Schumacher 7 vs Hamilton 7), avoid WDC and prioritize wins, poles, or gps
    if (champDiff > 0 && ((d1.championships || 0) > 0 || (d2.championships || 0) > 0)) {
      candidates.push({ config: METRICS.find(m => m.key === 'championships')!, weight: 8 });
    }

    if (winDiff > 0 && ((d1.wins || 0) > 0 || (d2.wins || 0) > 0)) {
      // Very exciting metric if both won races
      candidates.push({ config: METRICS.find(m => m.key === 'wins')!, weight: 10 });
    }

    if (poleDiff > 0 && ((d1.poles || 0) > 0 || (d2.poles || 0) > 0)) {
      candidates.push({ config: METRICS.find(m => m.key === 'poles')!, weight: 9 });
    }

    if (podDiff > 0 && ((d1.podiums || 0) > 0 || (d2.podiums || 0) > 0)) {
      candidates.push({ config: METRICS.find(m => m.key === 'podiums')!, weight: 7 });
    }

    if (gpDiff > 5) {
      candidates.push({ config: METRICS.find(m => m.key === 'gps')!, weight: 5 });
    }

    if (ptsDiff > 50) {
      candidates.push({ config: METRICS.find(m => m.key === 'points')!, weight: 4 });
    }

    if (candidates.length > 0) {
      // Pick one randomly weighted by relevance
      const totalWeight = candidates.reduce((acc, c) => acc + c.weight, 0);
      let randomVal = Math.random() * totalWeight;
      for (const cand of candidates) {
        if (randomVal < cand.weight) return cand.config;
        randomVal -= cand.weight;
      }
      return candidates[0].config;
    }

    return METRICS[Math.floor(Math.random() * METRICS.length)];
  };

  const [currentDriver, setCurrentDriver] = useState<any>(() => getRandomDriver());
  const [challengerDriver, setChallengerDriver] = useState<any>(() => getRandomDriver());
  const [metric, setMetric] = useState<MetricConfig>(() => {
    const d1 = eligibleDrivers[0] || {};
    const d2 = eligibleDrivers[1] || {};
    return getRelevantMetric(d1, d2);
  });

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('lightsout_higher_lower_best') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { addCoins } = useStore();

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (isRevealed || isGameOver) return;

    const valA = currentDriver[metric.key] ?? 0;
    const valB = challengerDriver[metric.key] ?? 0;

    const correct = (guess === 'higher' && valB >= valA) || (guess === 'lower' && valB <= valA);

    setIsRevealed(true);
    setIsCorrect(correct);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('lightsout_higher_lower_best', newScore.toString());
        } catch {}
      }
      addCoins(25 + newScore * 5);

      // Advance to next round after delay
      setTimeout(() => {
        const next = getRandomDriver(challengerDriver.id);
        setCurrentDriver(challengerDriver);
        setChallengerDriver(next);
        // Select the most relevant differentiating metric between the two drivers
        setMetric(getRelevantMetric(challengerDriver, next));
        setIsRevealed(false);
        setIsCorrect(null);
      }, 1500);
    } else {
      setTimeout(() => {
        setIsGameOver(true);
      }, 1500);
    }
  };

  const restartGame = () => {
    const d1 = getRandomDriver();
    const d2 = getRandomDriver(d1.id);
    setCurrentDriver(d1);
    setChallengerDriver(d2);
    setMetric(getRelevantMetric(d1, d2));
    setScore(0);
    setIsRevealed(false);
    setIsCorrect(null);
    setIsGameOver(false);
  };

  const handleShare = () => {
    const text = `🔥 F1 HIGHER OR LOWER // LIGHTS OUT\n🏆 Racha lograda: ${score} aciertos consecutivos\n👑 Récord personal: ${highScore}\n🏎️ ¿Podrás superarme? Juega en https://lightsout.f1`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-[9px] uppercase tracking-[0.25em] font-bold mb-1">
            STATISTICAL DUEL // 1950 - 2026
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-syne tracking-tighter uppercase text-white">
            HIGHER <span className="text-[#e10600]">OR LOWER</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-white/10 rounded-sm">
            <Flame size={14} className="text-orange-500" />
            <span className="text-[10px] font-mono text-white/50 uppercase">RACHA:</span>
            <span className="text-lg font-mono font-black text-white">{score}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-white/10 rounded-sm">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-white/50 uppercase">RÉCORD:</span>
            <span className="text-lg font-mono font-black text-yellow-400">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Metric Question Banner */}
      <div className="text-center p-3 bg-white/[0.02] border border-white/10 rounded-sm">
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-0.5">
          COMPARANDO MÉTRICA HISTÓRICA
        </span>
        <span className="text-sm sm:text-base font-f1 font-bold text-white uppercase tracking-wider text-emerald-400">
          ¿Tiene {challengerDriver?.name} MÁS O MENOS {metric.label} que {currentDriver?.name}?
        </span>
      </div>

      {/* Duel Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* VS Badge in the center */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black border-2 border-white/20 items-center justify-center font-black font-syne text-sm text-white shadow-2xl">
          VS
        </div>

        {/* Left Card: Benchmark Driver */}
        <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded-sm flex flex-col justify-between min-h-[340px] relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest block mb-1">
                PILOTO DE REFERENCIA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-f1 uppercase text-white leading-tight">
                {currentDriver.name}
              </h2>
              <span className="text-xs font-mono text-white/60 block mt-1">
                {currentDriver.country} • {currentDriver.team}
              </span>
              <span className="text-[9px] font-mono text-white/40 block mt-0.5">
                Debut: {currentDriver.debutYear} | Último GP: {currentDriver.lastYear || 'PRESENTE'}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center bg-black/40 p-4 rounded-xs border border-white/5">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              {currentDriver[metric.key]?.toLocaleString() ?? 0}
            </span>
            <span className="text-[10px] font-mono uppercase text-white/40 block mt-1 tracking-widest">
              {metric.unit}
            </span>
          </div>
        </div>

        {/* Right Card: Challenger Driver */}
        <div className={`p-6 bg-[#0c0c0c] border rounded-sm flex flex-col justify-between min-h-[340px] relative overflow-hidden transition-all ${
          isRevealed 
            ? isCorrect 
              ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
              : 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/10'
            : 'border-white/10'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest block mb-1">
                DESAFIANTE A EVALUAR
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-f1 uppercase text-white leading-tight">
                {challengerDriver.name}
              </h2>
              <span className="text-xs font-mono text-white/60 block mt-1">
                {challengerDriver.country} • {challengerDriver.team}
              </span>
              <span className="text-[9px] font-mono text-white/40 block mt-0.5">
                Debut: {challengerDriver.debutYear} | Último GP: {challengerDriver.lastYear || 'PRESENTE'}
              </span>
            </div>
          </div>

          {/* Interactive Higher / Lower Buttons OR Revealed Value */}
          <div className="mt-8">
            {!isRevealed && !isGameOver ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess('higher')}
                  className="py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-black font-syne font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 rounded-xs shadow-lg shadow-emerald-600/20"
                >
                  <ArrowUp size={18} strokeWidth={3} />
                  <span>MÁS ({metric.key.toUpperCase()})</span>
                </button>

                <button
                  onClick={() => handleGuess('lower')}
                  className="py-4 px-4 bg-red-600 hover:bg-red-500 text-white font-syne font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 rounded-xs shadow-lg shadow-red-600/20"
                >
                  <ArrowDown size={18} strokeWidth={3} />
                  <span>MENOS</span>
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-6 border-t border-white/10 text-center bg-black/40 p-4 rounded-xs border border-white/5"
              >
                <div className="flex items-center justify-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  ) : (
                    <XCircle size={24} className="text-red-500" />
                  )}
                  <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${isCorrect ? 'text-emerald-400' : 'text-red-500'}`}>
                    {challengerDriver[metric.key]?.toLocaleString() ?? 0}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-white/40 block mt-1 tracking-widest">
                  {metric.unit} ({isCorrect ? '¡CORRECTO!' : 'FALLO'})
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Modal / Card */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 bg-gradient-to-b from-[#141414] to-black border border-red-500/30 rounded-sm text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[9px] uppercase tracking-widest font-bold">
            FIN DE LA RACHA // TELEMETRÍA INCORRECTA
          </div>
          <h3 className="text-3xl sm:text-4xl font-black font-syne text-white uppercase tracking-tight">
            RACHA FINAL: <span className="text-[#e10600]">{score}</span> ACIERTOS
          </h3>
          <p className="text-white/60 text-xs font-mono max-w-md mx-auto">
            {challengerDriver.name} tiene {challengerDriver[metric.key]} {metric.unit}, mientras que {currentDriver.name} tiene {currentDriver[metric.key]}.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-white text-black font-syne font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>JUGAR DE NUEVO</span>
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Share2 size={14} />
              <span>{copied ? '¡COPIADO!' : 'COMPARTIR RACHA'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
