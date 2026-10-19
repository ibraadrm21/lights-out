import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Zap, Award, HelpCircle } from 'lucide-react';

interface DailyQuizRunnerProps {
  config: {
    questionCount: number;
    minCorrectRequired: number;
    questions: Array<{
      hash: string;
      category: string;
      difficulty: string;
      text: string;
      options: string[];
      points: number;
      explanation?: string;
    }>;
  };
  onComplete: (result: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    completed: boolean;
    timeElapsedMs: number;
  }) => void;
  onCancel: () => void;
}

export const DailyQuizRunner: React.FC<DailyQuizRunnerProps> = ({ config, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [startTime] = useState<number>(Date.now());

  const currentQ = config.questions[currentIndex];
  const isLastQuestion = currentIndex >= config.questions.length - 1;

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(opt);
    setShowExplanation(true);

    // AI Engine questions explanation contains correct answer or we verify against options
    // In our generator, explanation states: "El trazado de ...", "Palmarés ...", etc.
    // If not matched, we check standard answer logic. For the daily quiz, we can verify deterministically.
    const isCorrect = currentQ.explanation?.includes(opt) || opt === currentQ.options[0]; // Options shuffled, but answer matches explanation
    
    // Check if opt is contained in explanation or if it's the target
    const isActuallyCorrect = currentQ.explanation 
      ? currentQ.explanation.toLowerCase().includes(opt.toLowerCase())
      : true;

    if (isActuallyCorrect) {
      setCorrectCount(prev => prev + 1);
      setAccumulatedScore(prev => prev + currentQ.points);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const timeElapsed = Date.now() - startTime;
      const finalCompleted = (correctCount + (selectedOption && currentQ.explanation?.toLowerCase().includes(selectedOption.toLowerCase()) ? 0 : 0)) >= config.minCorrectRequired;
      onComplete({
        score: accumulatedScore,
        correctCount,
        totalQuestions: config.questionCount,
        completed: correctCount >= config.minCorrectRequired,
        timeElapsedMs: timeElapsed
      });
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="bg-[#0e0e14] border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-6 text-[10px] font-mono text-white/50 uppercase">
        <span>PREGUNTA {currentIndex + 1} DE {config.questionCount}</span>
        <span className="text-[#e10600] font-bold">OBJETIVO: MÍNIMO {config.minCorrectRequired} ACIERTOS</span>
        <span>ACIERTOS: {correctCount}</span>
      </div>

      <div className="w-full bg-white/10 h-1.5 mb-8">
        <div 
          className="bg-[#e10600] h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / config.questionCount) * 100}%` }}
        />
      </div>

      {currentQ && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-mono tracking-widest text-[#00d2be] uppercase px-2.5 py-1 bg-[#00d2be]/10 border border-[#00d2be]/20">
              {currentQ.category}
            </span>
            <span className="text-[9px] font-mono text-white/40 uppercase">
              DIFICULTAD: {currentQ.difficulty}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-syne text-white mb-8 leading-snug">
            {currentQ.text}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const hasAnswered = selectedOption !== null;
              const isCorrect = currentQ.explanation?.toLowerCase().includes(opt.toLowerCase());

              let btnStyle = 'border-white/10 bg-[#14141e] text-white/80 hover:bg-white/10 hover:border-white/30';
              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-[#e10600] bg-[#e10600]/15 text-red-300 ring-1 ring-[#e10600]';
                } else {
                  btnStyle = 'border-white/5 bg-black/40 text-white/20';
                }
              }

              return (
                <button
                  key={`${i}-${opt}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={hasAnswered}
                  className={`p-4 sm:p-5 border text-left transition-all relative flex items-center justify-between group cursor-pointer ${btnStyle}`}
                >
                  <span className="font-sans font-medium text-sm pr-4">{opt}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle size={16} className="text-[#e10600] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Debrief */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 border border-white/10 bg-white/5 text-xs text-white/80"
              >
                <div className="flex items-center gap-2 mb-1 font-mono text-[9px] text-[#e10600] uppercase font-bold">
                  <HelpCircle size={12} />
                  <span>DEBRIEF TÉCNICO:</span>
                </div>
                <p>{currentQ.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[10px] font-mono text-white/40 hover:text-white uppercase transition-colors"
            >
              Abandonar Reto
            </button>

            {selectedOption !== null && (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[#e10600] text-white hover:bg-[#ff2b0f] font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{isLastQuestion ? 'Finalizar Reto Diario' : 'Siguiente Pregunta'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
