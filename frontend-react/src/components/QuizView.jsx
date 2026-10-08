import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { F1AIEngine } from '../ai-engine.js';
import { SpotlightCard, DecryptedText } from './motion-primitives.jsx';

export function QuizView({ store, updateNavTelemetry, onReturnHome }) {
  const [engine] = useState(() => new F1AIEngine(new Set(store.getServedHashes())));
  const [question, setQuestion] = useState(() => {
    const q = engine.generateNextQuestion();
    store.recordServedHash(q.hash);
    return q;
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const user = store.getUser();

  const handleSelectOption = (opt) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);

    const isCorrect = opt === question.correctAnswer;
    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        text: `¡POLE POSITION! Respuesta impecable. Has sumado +${question.points} PTS y +40 PitCoins.`,
      });
      store.addPointsAndCoins(question.points, 40, `Quiz F1: ${question.category}`);
      updateNavTelemetry();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ff1801', '#00f2fe', '#ffffff', '#fbbf24'],
        });
      } catch (e) {}
    } else {
      setFeedback({
        isCorrect: false,
        text: `BANDERA AMARILLA. La opción correcta era: "${question.correctAnswer}". ${question.explanation || ''}`,
      });
    }
  };

  const handleNextQuestion = () => {
    const nextQ = engine.generateNextQuestion();
    store.recordServedHash(nextQ.hash);
    setQuestion(nextQ);
    setSelectedOption(null);
    setFeedback(null);
    updateNavTelemetry();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="clean-card p-6 sm:p-10"
    >
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-white/[0.06] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded uppercase">
              Motor Procedural AI
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">Dificultad {question.difficulty.toUpperCase()}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight uppercase">
            F1 Quiz Master
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">Recompensa ronda:</div>
            <div className="text-sm font-mono font-bold text-amber-400">
              +{question.points} PTS <span className="text-white/30">&bull;</span> +40 🪙
            </div>
          </div>
          <button
            onClick={onReturnHome}
            className="btn-clean-secondary !py-2 !px-3.5 text-xs font-semibold"
          >
            &larr; Paddock
          </button>
        </div>
      </div>

      {/* Question Card with Spotlight */}
      <SpotlightCard className="clean-card p-6 sm:p-8 mb-8 border-l-4 border-l-[#ff1801]">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-4 flex-wrap gap-2">
          <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
            Pregunta Hash #{user.servedQuestionHashes.length} ({question.remainingPoolCount ?? 0} en cola procedural)
          </span>
          <span className="text-slate-300 font-medium">
            Categoría: <strong className="text-white">{question.category}</strong>
          </span>
        </div>

        <div className="text-lg sm:text-2xl font-bold text-white font-['Space_Grotesk'] leading-snug">
          <DecryptedText text={question.text} speed={25} maxIterations={4} />
        </div>
      </SpotlightCard>

      {/* 4 Clean Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === question.correctAnswer;
          const showResult = selectedOption !== null;

          let btnClass = 'bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/20';

          if (showResult) {
            if (isCorrect) {
              btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
            } else if (isSelected) {
              btnClass = 'bg-[#ff1801]/20 border-[#ff1801] text-red-200';
            } else {
              btnClass = 'bg-black/20 border-white/[0.04] text-slate-500 opacity-60';
            }
          }

          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <motion.button
              key={opt}
              whileHover={!showResult ? { scale: 1.01, y: -1 } : {}}
              whileTap={!showResult ? { scale: 0.99 } : {}}
              onClick={() => handleSelectOption(opt)}
              disabled={showResult}
              className={`p-4 sm:p-5 rounded-xl border text-left flex items-center gap-4 transition-all duration-200 font-medium ${btnClass}`}
            >
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                {optionLabels[i]}
              </span>
              <span className="text-sm sm:text-base font-['Space_Grotesk'] leading-normal">
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              feedback.isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-[#ff1801]/10 border-[#ff1801]/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{feedback.isCorrect ? '🏁' : '⚠️'}</span>
              <div className="text-sm leading-relaxed">{feedback.text}</div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="btn-clean-primary whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              Siguiente Desafío &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Footer */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Garantía FIA: Base algorítmica sin colisión de hashes</span>
        <span className="text-white font-bold">{user.score} PTS ACUMULADOS</span>
      </div>
    </motion.div>
  );
}
