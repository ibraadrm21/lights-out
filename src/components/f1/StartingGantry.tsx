import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { F1CarIcon, PitCoinIcon } from '../common/F1Icons';

// Web Audio API synthesizer for authentic F1 pit and start beep sounds
const playTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
};

export const StartingGantry: React.FC = () => {
  const [lightsActive, setLightsActive] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'starting' | 'ready' | 'go' | 'jump_start'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestReaction, setBestReaction] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { addCoins } = useStore();

  const clearAllTimers = () => {
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
  };

  const startSequence = () => {
    clearAllTimers();
    setLightsActive(0);
    setGameState('starting');
    setReactionTime(null);

    // Sequence of 5 red lights turning on one every 1000ms
    for (let i = 1; i <= 5; i++) {
      const timer = setTimeout(() => {
        setLightsActive(i);
        playTone(440 + i * 40, 0.15, 'triangle');
      }, i * 1000);
      timeoutRefs.current.push(timer);
    }

    // Random lights out delay between 1.0s and 4.0s after all 5 lights are on (FIA authentic regulation)
    const holdDelayMs = 1000 + Math.random() * 3000;
    const randomDelay = 5000 + holdDelayMs;
    const lightsOutTimer = setTimeout(() => {
      setLightsActive(0);
      setGameState('go');
      startTimeRef.current = performance.now();
      playTone(880, 0.4, 'sawtooth');
    }, randomDelay);
    timeoutRefs.current.push(lightsOutTimer);
  };

  const handleLaunchClick = () => {
    if (gameState === 'starting') {
      // Jump start penalty!
      clearAllTimers();
      setGameState('jump_start');
      setLightsActive(5);
      playTone(150, 0.5, 'square');
      return;
    }

    if (gameState === 'go') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);
      setGameState('idle');
      if (!bestReaction || elapsed < bestReaction) {
        setBestReaction(elapsed);
      }
      // Reward coins for lightning reaction
      if (elapsed < 300) {
        addCoins(50);
        playTone(1200, 0.3, 'sine');
      } else if (elapsed < 400) {
        addCoins(25);
      }
    }
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-6 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-sm">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e10600] animate-pulse" />
          <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-white/50 uppercase">
            FIA OFFICIAL START GANTRY // SS26
          </span>
        </div>
        {bestReaction && (
          <span className="text-[9px] font-mono text-[#00d2be] tracking-widest uppercase">
            PB: {bestReaction} ms
          </span>
        )}
      </div>

      {/* 5 Gantry Pods */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 my-6 py-4 bg-black/60 border border-white/5 rounded-sm">
        {[1, 2, 3, 4, 5].map((podIndex) => {
          const isLit = lightsActive >= podIndex;
          const isJump = gameState === 'jump_start';
          return (
            <div key={podIndex} className="flex flex-col items-center gap-1.5 p-2 bg-[#121212] border border-white/10 rounded-sm">
              <div
                className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full transition-all duration-150 ${
                  isLit || isJump
                    ? 'bg-[#e10600] shadow-[0_0_20px_#e10600] ring-2 ring-red-400'
                    : 'bg-[#220000] border border-white/10'
                }`}
              />
              <span className="text-[7px] font-mono text-white/20">{podIndex}</span>
            </div>
          );
        })}
      </div>

      {/* Status & Feedback */}
      <div className="text-center min-h-[44px] flex flex-col items-center justify-center">
        {gameState === 'idle' && reactionTime === null && (
          <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
            Pulsa Iniciar para preparar la salida de carrera
          </p>
        )}
        {gameState === 'starting' && (
          <p className="text-xs font-mono font-bold text-[#e10600] tracking-widest uppercase animate-pulse">
            ESPÉRANDO A QUE SE APAGUEN LAS LUCES... ¡NO SALGAS ANTES!
          </p>
        )}
        {gameState === 'go' && (
          <p className="text-sm font-mono font-black text-emerald-400 tracking-widest uppercase animate-bounce">
            ¡LIGHTS OUT AND AWAY WE GO! PULSA AHORA
          </p>
        )}
        {gameState === 'jump_start' && (
          <div className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-500" />
            <span>JUMP START DETECTADO (+5s PENALIZACIÓN DE STOP & GO)</span>
          </div>
        )}
        {reactionTime !== null && (
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-2xl font-syne font-black text-white">
              {reactionTime} <span className="text-xs text-white/50">MS</span>
            </span>
            <span
              className={`text-[9px] font-mono uppercase px-2 py-0.5 border flex items-center gap-1.5 ${
                reactionTime < 250
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : reactionTime < 350
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  : 'border-white/20 text-white/60 bg-white/5'
              }`}
            >
              {reactionTime < 220 ? (
                <>
                  <Zap size={11} className="text-yellow-400" />
                  <span>TIEMPO F1 PRO (+50 COINS)</span>
                </>
              ) : reactionTime < 320 ? (
                <>
                  <F1CarIcon size={13} className="text-emerald-400" />
                  <span>SALIDA SÓLIDA (+25 COINS)</span>
                </>
              ) : (
                'TIEMPO REACCIÓN MEJORABLE'
              )}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {gameState === 'idle' || gameState === 'jump_start' ? (
          <button
            onClick={startSequence}
            className="flex-1 py-3 px-6 bg-white hover:bg-neutral-200 text-black font-bold text-[10px] tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-2"
          >
            <Zap size={14} className="fill-black" />
            <span>Iniciar Semáforo de Salida</span>
          </button>
        ) : (
          <button
            onClick={handleLaunchClick}
            className={`flex-1 py-4 px-6 font-black text-xs tracking-[0.3em] uppercase transition-all border ${
              gameState === 'go'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 animate-pulse'
                : 'bg-[#e10600] hover:bg-red-700 text-white border-red-500'
            }`}
          >
            {gameState === 'go' ? '¡¡SALIR A PISTA YA!!' : '¡AGUANTA! NO PULSES ANTES'}
          </button>
        )}

        {(reactionTime !== null || gameState === 'jump_start') && (
          <button
            onClick={startSequence}
            className="py-3 px-4 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-[9px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={12} />
            <span>Reiniciar</span>
          </button>
        )}
      </div>
    </div>
  );
};
