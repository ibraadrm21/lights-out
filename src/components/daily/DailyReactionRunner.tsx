import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface DailyReactionRunnerProps {
  config: {
    targetReactionMs: number;
    attemptsAllowed: number;
    fixedGantryHoldMs: number;
  };
  onComplete: (result: {
    score: number;
    bestReactionMs: number;
    completed: boolean;
    timeElapsedMs: number;
  }) => void;
  onCancel: () => void;
}

export const DailyReactionRunner: React.FC<DailyReactionRunnerProps> = ({ config, onComplete, onCancel }) => {
  const [lightsActive, setLightsActive] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'starting' | 'go' | 'jump_start' | 'round_finished'>('idle');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [lastMs, setLastMs] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const startGantry = () => {
    clearAllTimers();
    setLightsActive(0);
    setGameState('starting');
    setLastMs(null);

    // 5 lights turning on sequentially
    for (let i = 1; i <= 5; i++) {
      const timer = setTimeout(() => {
        setLightsActive(i);
      }, i * 900);
      timeoutRefs.current.push(timer);
    }

    // Official hold delay
    const totalGantryTime = 5 * 900 + config.fixedGantryHoldMs;
    const lightsOutTimer = setTimeout(() => {
      setLightsActive(0);
      setGameState('go');
      startTimeRef.current = performance.now();
    }, totalGantryTime);
    timeoutRefs.current.push(lightsOutTimer);
  };

  const handleAction = () => {
    if (gameState === 'starting') {
      clearAllTimers();
      setGameState('jump_start');
      setLightsActive(5);
      return;
    }

    if (gameState === 'go') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setLastMs(elapsed);
      const updated = [...reactionTimes, elapsed];
      setReactionTimes(updated);
      setGameState('round_finished');

      const isFinalAttempt = currentAttempt >= config.attemptsAllowed;
      const best = Math.min(...updated);
      const targetMet = best <= config.targetReactionMs;

      if (isFinalAttempt || targetMet) {
        // Complete challenge
        setTimeout(() => {
          onComplete({
            score: Math.max(100, Math.round(1000 - best * 2)),
            bestReactionMs: best,
            completed: targetMet,
            timeElapsedMs: best
          });
        }, 1200);
      }
    }
  };

  const nextAttempt = () => {
    setCurrentAttempt(prev => prev + 1);
    setGameState('idle');
  };

  const bestSoFar = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null;

  return (
    <div className="bg-[#0e0e14] border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      {/* Telemetry Header */}
      <div className="flex justify-between items-center mb-6 text-[10px] font-mono text-white/50 uppercase">
        <span>INTENTO {currentAttempt} DE {config.attemptsAllowed}</span>
        <span className="text-[#e10600] font-bold">OBJETIVO: INFERIOR A {config.targetReactionMs} MS</span>
        <span>MEJOR MARCA: {bestSoFar ? `${bestSoFar} ms` : '--'}</span>
      </div>

      {/* Starting Gantry Display */}
      <div className="flex justify-center items-center py-10 bg-black/50 border border-white/5 mb-8">
        <div className="flex gap-4 sm:gap-6 bg-[#18181f] p-4 sm:p-6 border border-white/10 rounded-sm">
          {[1, 2, 3, 4, 5].map((lightNum) => (
            <div key={lightNum} className="flex flex-col gap-2 items-center">
              <div 
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-150 ${
                  lightsActive >= lightNum
                    ? 'bg-[#e10600] border-[#ff4d36] shadow-[0_0_25px_#e10600]'
                    : 'bg-[#250000] border-white/10'
                }`}
              />
              <span className="text-[7px] font-mono text-white/30">{lightNum}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Touch / Click Interaction Area */}
      <div 
        onClick={handleAction}
        className={`w-full py-16 sm:py-20 border text-center transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
          gameState === 'starting'
            ? 'border-yellow-500/30 bg-yellow-950/10'
            : gameState === 'go'
            ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-pulse'
            : gameState === 'jump_start'
            ? 'border-[#e10600] bg-[#e10600]/20'
            : 'border-white/10 bg-white/5 hover:bg-white/10'
        }`}
      >
        {gameState === 'idle' && (
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#e10600] uppercase block mb-2 font-bold">
              [ PULSA PARA INICIAR LA SECUENCIA DE SALIDA ]
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); startGantry(); }}
              className="px-8 py-4 bg-[#e10600] text-white font-bold text-xs tracking-widest uppercase hover:bg-[#ff2b0f] transition-all"
            >
              ENCENDER SEMÁFORO
            </button>
          </div>
        )}

        {gameState === 'starting' && (
          <div className="text-yellow-400 font-mono text-sm tracking-widest uppercase animate-pulse">
            ATENTO AL APAGADO DEL SEMÁFORO... (NO TE ADELANTES)
          </div>
        )}

        {gameState === 'go' && (
          <div className="text-emerald-400 font-black font-syne text-3xl sm:text-4xl tracking-tighter uppercase">
            ¡¡LIGHTS OUT!! ¡PULSA YA!
          </div>
        )}

        {gameState === 'jump_start' && (
          <div className="text-[#e10600]">
            <AlertTriangle size={32} className="mx-auto mb-2" />
            <span className="font-bold font-syne text-xl block mb-1">JUMP START // SALIDA EN FALSO</span>
            <span className="text-xs font-mono text-white/60">Has pulsado antes del apagado.</span>
            <div className="mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); startGantry(); }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {gameState === 'round_finished' && (
          <div>
            <span className="text-4xl sm:text-5xl font-black font-syne text-white block mb-2">
              {lastMs} <span className="text-lg text-white/50">MS</span>
            </span>
            <span className={`text-xs font-mono uppercase font-bold ${
              (lastMs || 999) <= config.targetReactionMs ? 'text-emerald-400' : 'text-yellow-400'
            }`}>
              {(lastMs || 999) <= config.targetReactionMs ? '✓ ¡OBJETIVO DIARIO SUPERADO!' : 'Tiempo registrado.'}
            </span>
            {currentAttempt < config.attemptsAllowed && (
              <div className="mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); nextAttempt(); }}
                  className="px-6 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono uppercase"
                >
                  Siguiente Intento ({currentAttempt + 1}/{config.attemptsAllowed})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-[10px] font-mono text-white/40 hover:text-white uppercase transition-colors"
        >
          Abandonar Desafío
        </button>
      </div>
    </div>
  );
};
