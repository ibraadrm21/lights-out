import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Award, Zap, HelpCircle, RefreshCw, Cpu, Server } from 'lucide-react';
import { LightsOutApiClient } from '../../lib/lightsoutApi';
import { useStore } from '../../store/useStore';

interface QuestionState {
  question: string;
  answer: string;
  options: string[];
  category: string;
  difficulty: string;
  explanation?: string;
  points: number;
  hash: string;
  source: 'backend_api' | 'procedural_ai_engine';
}

export const QuizMasterView: React.FC = () => {
  const [currentQ, setCurrentQ] = useState<QuestionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const { addCoins } = useStore();

  const loadNextQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
      const q = await LightsOutApiClient.fetchNextQuizQuestion();
      setCurrentQ(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const handleSelect = (option: string) => {
    if (!currentQ || selectedOption !== null) return;
    setSelectedOption(option);
    setShowExplanation(true);
    setQuestionsAnswered(prev => prev + 1);

    const isCorrect = option === currentQ.answer;
    if (isCorrect) {
      const bonus = streak * 25;
      const totalPoints = currentQ.points + bonus;
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      addCoins(totalPoints);
    } else {
      setStreak(0);
    }
  };

  return (
    <section id="quiz" className="py-24 px-6 w-full max-w-5xl mx-auto border-b border-white/5">
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-[#e10600] uppercase bg-[#e10600]/10 px-2 py-0.5 border border-[#e10600]/30 flex items-center gap-1.5">
              <Cpu size={11} />
              AI ENGINE // LIGHTS OUT API
            </span>
            {currentQ && (
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
                HASH #{currentQ.hash.slice(0, 8)}
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tighter">
            QUIZ <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}>MASTER</span>
          </h2>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 bg-[#0e0e0e] border border-white/10 px-5 py-3">
          <div className="text-right border-r border-white/10 pr-4">
            <span className="text-[8px] font-mono text-white/40 uppercase block">Racha Actual</span>
            <span className="text-sm font-mono font-bold text-[#e10600] flex items-center gap-1 justify-end">
              <Zap size={12} className="fill-[#e10600]" /> {streak}x
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-white/40 uppercase block">Puntos Acumulados</span>
            <span className="text-sm font-syne font-black text-white">{score} PTS</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle Grid overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#e10600] rounded-full animate-spin mb-4" />
              <span className="text-[9px] font-mono tracking-[0.3em] text-white/50 uppercase">
                GENERANDO PREGUNTA DESDE LIGHTS OUT API...
              </span>
            </div>
          ) : currentQ ? (
            <>
              {/* Category tag & Source Badge */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono tracking-widest text-white/50 uppercase px-2.5 py-1 bg-white/5 border border-white/10">
                    CATEGORÍA: <strong className="text-white">{currentQ.category}</strong>
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-[#00d2be] uppercase px-2 py-0.5 bg-[#00d2be]/10 border border-[#00d2be]/20 flex items-center gap-1">
                    <Server size={10} />
                    {currentQ.category.includes('OPENF1')
                      ? 'OPENF1 LIVE TELEMETRY'
                      : currentQ.source === 'backend_api'
                      ? 'FLASK API :5000'
                      : 'AI ENGINE // 21.400+ POOL'}
                  </span>
                </div>
                <span className="text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 border border-white/10 text-white/40">
                  RECOMPENSA: +{currentQ.points} COINS
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg sm:text-2xl font-bold font-syne text-white mb-8 leading-snug">
                {currentQ.question}
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.answer;
                  const hasAnswered = selectedOption !== null;

                  let btnStyle = 'border-white/10 bg-[#121212] text-white/80 hover:bg-[#1a1a1a] hover:border-white/30';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-[#e10600] bg-[#e10600]/15 text-red-300 ring-1 ring-[#e10600]';
                    } else {
                      btnStyle = 'border-white/5 bg-[#0e0e0e] text-white/30 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt + i}
                      onClick={() => handleSelect(opt)}
                      disabled={hasAnswered}
                      className={`p-4 border text-left transition-all duration-200 flex items-center justify-between group ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-white/30 border border-white/10 w-5 h-5 flex items-center justify-center">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{opt}</span>
                      </div>

                      {hasAnswered && isCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-[#e10600] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Telemetry Explanation Box */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-5 mb-8 border ${
                      selectedOption === currentQ.answer
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-red-500/30 bg-red-950/20 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 font-mono text-[9px] tracking-widest uppercase font-bold">
                      <HelpCircle size={12} />
                      <span>TELEMETRY DEBRIEF // EXPLICACIÓN OFICIAL:</span>
                    </div>
                    <p className="text-xs font-normal leading-relaxed text-white/80">
                      {currentQ.explanation || `Respuesta correcta: ${currentQ.answer}.`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Question Button */}
              {selectedOption !== null && (
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[9px] font-mono text-white/40 uppercase">
                    RESPONDIDAS: {questionsAnswered} SESIONES
                  </span>
                  <button
                    onClick={loadNextQuestion}
                    className="px-8 py-4 bg-white text-black hover:bg-neutral-200 font-bold text-[10px] tracking-[0.25em] uppercase transition-all flex items-center gap-2"
                  >
                    <span>Siguiente Pregunta AI</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};
