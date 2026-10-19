import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ArrowRight, Zap, Trophy, 
  Flame, Target, Timer, Eye, MapPin, AlertCircle, ArrowUp, ArrowDown 
} from 'lucide-react';
import type { DailyGameRound } from '../../types/daily';

interface DailyGameModalProps {
  round: DailyGameRound;
  onComplete: (result: { score: number; completed: boolean; payload?: any }) => void;
  onCancel: () => void;
}

export const DailyGameModal: React.FC<DailyGameModalProps> = ({ round, onComplete, onCancel }) => {
  const { id: gameId, meta, config } = round;

  // 1. QUIZ MASTER STATE
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);

  // 2. DRIVERLE STATE
  const [driverleGuess, setDriverleGuess] = useState('');
  const [driverleAttempts, setDriverleAttempts] = useState<string[]>([]);
  const [driverleSolved, setDriverleSolved] = useState(false);

  // 3. REACTION TEST STATE
  const [reactionLights, setReactionLights] = useState(0);
  const [reactionState, setReactionState] = useState<'idle' | 'starting' | 'go' | 'jump'>('idle');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const startTimeRef = React.useRef<number>(0);

  // 4. HIGHER OR LOWER STATE
  const [duelIndex, setDuelIndex] = useState(0);
  const [duelWins, setDuelWins] = useState(0);
  const [duelResult, setDuelResult] = useState<boolean | null>(null);

  // 5. HELMET GUESS STATE
  const [helmetSelected, setHelmetSelected] = useState<string | null>(null);
  const [cluesRevealed, setCluesRevealed] = useState(1);

  // 6. CIRCUITS GEOGUESSR STATE
  const [circuitGuessedKm, setCircuitGuessedKm] = useState<number | null>(null);

  // --- QUIZ HANDLER ---
  const handleQuizSelect = (opt: string) => {
    if (quizSelected !== null) return;
    setQuizSelected(opt);
    const curQ = config.questions[quizIndex];
    const isCorrect = curQ.explanation ? curQ.explanation.toLowerCase().includes(opt.toLowerCase()) : opt === curQ.options[0];
    if (isCorrect) setQuizCorrectCount(prev => prev + 1);
  };

  const handleQuizNext = () => {
    if (quizIndex < config.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setQuizSelected(null);
    } else {
      const finalCount = quizCorrectCount;
      const completed = finalCount >= config.minCorrect;
      const score = Math.round((finalCount / config.questionCount) * meta.maxScore);
      onComplete({ score, completed, payload: { correct: finalCount } });
    }
  };

  // --- DRIVERLE HANDLER ---
  const handleDriverleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverleGuess.trim()) return;
    const guess = driverleGuess.trim();
    const updated = [...driverleAttempts, guess];
    setDriverleAttempts(updated);
    setDriverleGuess('');

    const target = config.targetDriverName.toLowerCase();
    if (guess.toLowerCase() === target || target.includes(guess.toLowerCase())) {
      setDriverleSolved(true);
      const score = Math.max(200, meta.maxScore - (updated.length - 1) * 60);
      setTimeout(() => {
        onComplete({ score, completed: true, payload: { attempts: updated.length } });
      }, 1000);
    } else if (updated.length >= config.maxAttempts) {
      setTimeout(() => {
        onComplete({ score: 100, completed: false, payload: { attempts: updated.length } });
      }, 1000);
    }
  };

  // --- REACTION HANDLER ---
  const startReactionSequence = () => {
    setReactionState('starting');
    setReactionLights(0);
    setReactionMs(null);

    for (let i = 1; i <= 5; i++) {
      setTimeout(() => setReactionLights(i), i * 800);
    }

    setTimeout(() => {
      setReactionLights(0);
      setReactionState('go');
      startTimeRef.current = performance.now();
    }, 5 * 800 + config.fixedHoldMs);
  };

  const handleReactionPress = () => {
    if (reactionState === 'starting') {
      setReactionState('jump');
      setTimeout(() => {
        onComplete({ score: 50, completed: false, payload: { jumpStart: true } });
      }, 1200);
      return;
    }
    if (reactionState === 'go') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionMs(elapsed);
      const completed = elapsed <= config.targetReactionMs;
      const score = Math.max(100, Math.round(meta.maxScore - Math.max(0, elapsed - 180) * 2));
      setTimeout(() => {
        onComplete({ score, completed, payload: { reactionMs: elapsed } });
      }, 1200);
    }
  };

  // --- HIGHER LOWER HANDLER ---
  const handleDuelChoice = (choice: 'higher' | 'lower') => {
    const duel = config.duels[duelIndex];
    const isHigher = duel.valB > duel.valA;
    const isLower = duel.valB < duel.valA;
    const win = (choice === 'higher' && isHigher) || (choice === 'lower' && isLower) || (duel.valA === duel.valB);

    setDuelResult(win);
    const newWins = win ? duelWins + 1 : duelWins;
    if (win) setDuelWins(newWins);

    setTimeout(() => {
      if (duelIndex < config.duels.length - 1) {
        setDuelIndex(prev => prev + 1);
        setDuelResult(null);
      } else {
        const completed = newWins >= config.minWins;
        const score = Math.round((newWins / config.duels.length) * meta.maxScore);
        onComplete({ score, completed, payload: { wins: newWins } });
      }
    }, 1200);
  };

  // --- HELMET GUESS HANDLER ---
  const handleHelmetSelect = (opt: string) => {
    if (helmetSelected !== null) return;
    setHelmetSelected(opt);
    const isCorrect = opt.toLowerCase() === config.helmet.driverName.toLowerCase();
    const penalty = (cluesRevealed - 1) * 75;
    const score = isCorrect ? Math.max(150, meta.maxScore - penalty) : 50;
    setTimeout(() => {
      onComplete({ score, completed: isCorrect, payload: { correct: isCorrect } });
    }, 1200);
  };

  // --- CIRCUITS HANDLER ---
  const handleCircuitChoice = (optCountry: string) => {
    const isCorrect = optCountry.toLowerCase() === config.country.toLowerCase();
    const score = isCorrect ? meta.maxScore : 100;
    setCircuitGuessedKm(isCorrect ? 0 : 850);
    setTimeout(() => {
      onComplete({ score, completed: isCorrect, payload: { correct: isCorrect } });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e14] border border-white/15 w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#e10600] uppercase block mb-1 font-bold">
              [ RONDA DIARIA // 1 INTENTO OFICIAL ]
            </span>
            <h2 className="text-2xl font-black font-syne text-white uppercase">{meta.title}</h2>
          </div>
          <button 
            onClick={onCancel}
            className="text-xs font-mono text-white/50 hover:text-white uppercase px-2 py-1 bg-white/5 border border-white/10"
          >
            Cancelar
          </button>
        </div>

        {/* 1. QUIZ RUNNER */}
        {gameId === 'quiz' && (
          <div>
            <div className="flex justify-between text-xs font-mono text-white/50 mb-4">
              <span>PREGUNTA {quizIndex + 1} DE {config.questions.length}</span>
              <span>ACIERTOS: {quizCorrectCount}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-syne text-white mb-6">
              {config.questions[quizIndex].text}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {config.questions[quizIndex].options.map((opt: string, idx: number) => {
                const isSelected = quizSelected === opt;
                return (
                  <button
                    key={`${idx}-${opt}`}
                    disabled={quizSelected !== null}
                    onClick={() => handleQuizSelect(opt)}
                    className={`p-4 border text-left text-sm transition-all cursor-pointer ${
                      isSelected ? 'border-[#e10600] bg-[#e10600]/20 text-white font-bold' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizSelected !== null && (
              <button
                onClick={handleQuizNext}
                className="w-full py-3 bg-[#e10600] text-white font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>{quizIndex < config.questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Ronda'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* 2. DRIVERLE RUNNER */}
        {gameId === 'driverle' && (
          <div>
            <p className="text-sm text-white/70 mb-4">
              Adivina el piloto misterioso oficial del día. Tienes un máximo de {config.maxAttempts} intentos.
            </p>
            <form onSubmit={handleDriverleSubmit} className="flex gap-2 mb-6">
              <input 
                type="text"
                value={driverleGuess}
                onChange={(e) => setDriverleGuess(e.target.value)}
                placeholder="Escribe el nombre del piloto (ej: Alonso, Hamilton...)"
                className="flex-1 bg-black/50 border border-white/20 p-3 text-sm text-white focus:outline-none focus:border-[#e10600]"
              />
              <button
                type="submit"
                className="px-6 bg-[#00d2be] text-black font-bold font-mono text-xs uppercase"
              >
                Enviar
              </button>
            </form>
            <div className="space-y-2">
              {driverleAttempts.map((att, i) => (
                <div key={i} className="p-2.5 bg-white/5 border border-white/10 text-xs font-mono flex justify-between">
                  <span>Intento #{i + 1}: {att}</span>
                  <span className={att.toLowerCase() === config.targetDriverName.toLowerCase() ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                    {att.toLowerCase() === config.targetDriverName.toLowerCase() ? '✓ CORRECTO' : '✗ INCORRECTO'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. REACTION RUNNER */}
        {gameId === 'reaction' && (
          <div className="text-center py-6">
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((lightNum) => (
                <div
                  key={lightNum}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    reactionLights >= lightNum ? 'bg-[#e10600] border-[#ff4d36] shadow-[0_0_20px_#e10600]' : 'bg-[#250000] border-white/10'
                  }`}
                />
              ))}
            </div>
            <div 
              onClick={handleReactionPress}
              className={`p-12 border cursor-pointer select-none transition-all ${
                reactionState === 'go' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold text-2xl' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              {reactionState === 'idle' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); startReactionSequence(); }}
                  className="px-6 py-3 bg-[#e10600] text-white font-bold font-mono text-xs uppercase tracking-widest"
                >
                  Iniciar Secuencia
                </button>
              )}
              {reactionState === 'starting' && <span className="font-mono text-sm text-yellow-400">ESPERA AL APAGADO...</span>}
              {reactionState === 'go' && <span>¡¡PULSA YA!!</span>}
              {reactionState === 'jump' && <span className="font-mono text-sm text-red-400 font-bold">¡JUMP START! Salida en falso</span>}
              {reactionMs !== null && (
                <span className="block text-3xl font-black font-syne text-white mt-2">{reactionMs} MS</span>
              )}
            </div>
          </div>
        )}

        {/* 4. HIGHER OR LOWER RUNNER */}
        {gameId === 'higher_lower' && config.duels && (
          <div>
            <div className="text-xs font-mono text-white/50 mb-4 flex justify-between">
              <span>DUELO {duelIndex + 1} DE {config.duels.length}</span>
              <span>VICTORIAS: {duelWins}</span>
            </div>
            {config.duels[duelIndex] && (
              <div className="p-4 bg-white/5 border border-white/10 text-center mb-6">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-2 font-bold">
                  MÉTRICA: {config.duels[duelIndex].metricKey.toUpperCase()}
                </span>
                <div className="text-lg font-bold font-syne mb-1 text-white">
                  {config.duels[duelIndex].driverA.name} ({config.duels[duelIndex].valA})
                </div>
                <div className="text-xs font-mono text-white/50 my-2">VS</div>
                <div className="text-xl font-black font-syne text-[#f97316]">
                  {config.duels[duelIndex].driverB.name}
                </div>
                <p className="text-xs text-white/70 mt-3">
                  ¿Tiene {config.duels[duelIndex].driverB.name} MÁS o MENOS {config.duels[duelIndex].metricKey} que {config.duels[duelIndex].driverA.name}?
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={() => handleDuelChoice('higher')}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUp size={14} /> MÁS (HIGHER)
                  </button>
                  <button
                    onClick={() => handleDuelChoice('lower')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-xs uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowDown size={14} /> MENOS (LOWER)
                  </button>
                </div>
                {duelResult !== null && (
                  <div className={`mt-4 font-mono text-xs font-bold ${duelResult ? 'text-emerald-400' : 'text-red-400'}`}>
                    {duelResult ? '✓ ¡CORRECTO!' : '✗ INCORRECTO'} (Valor real: {config.duels[duelIndex].valB})
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. HELMET GUESS RUNNER */}
        {gameId === 'helmet_guess' && config.helmet && (
          <div>
            <div className="p-4 bg-white/5 border border-white/10 mb-4">
              <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest block mb-2">
                DESCRIPCIÓN DEL CASCO HISTÓRICO
              </span>
              <p className="text-xs text-white/80 leading-relaxed mb-3">
                {config.helmet.helmetDescription}
              </p>
              <div className="text-[10px] font-mono text-white/60">
                PISTA ({cluesRevealed}/3): {config.helmet.clues[cluesRevealed - 1]}
              </div>
              {cluesRevealed < 3 && (
                <button
                  onClick={() => setCluesRevealed(prev => prev + 1)}
                  className="mt-2 text-[9px] font-mono text-sky-400 hover:underline uppercase"
                >
                  + Revelar siguiente pista (-75 pts)
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {config.helmet.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  disabled={helmetSelected !== null}
                  onClick={() => handleHelmetSelect(opt)}
                  className="p-3 bg-black/40 border border-white/10 hover:border-white/30 text-xs font-medium text-white/80 text-left cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. CIRCUITS RUNNER */}
        {gameId === 'circuits' && config && (
          <div className="text-center py-4">
            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-2">
              RECONOCIMIENTO DE CIRCUITO OFICIAL
            </span>
            <h3 className="text-2xl font-black font-syne text-white mb-2">{config.circuitName}</h3>
            <p className="text-xs text-white/60 mb-6">
              ¿En qué país del calendario de Fórmula 1 se ubica este trazado?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['España', 'Bélgica', 'Italia', 'Japón', 'Brasil', 'Reino Unido', 'Australia', 'Canadá'].map((country) => (
                <button
                  key={country}
                  onClick={() => handleCircuitChoice(country)}
                  className="p-3 bg-white/5 border border-white/10 hover:border-white/30 text-xs font-mono text-white cursor-pointer"
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
