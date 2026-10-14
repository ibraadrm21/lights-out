import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, MapPin, Trophy, Radio } from 'lucide-react';
import { StartingGantry } from '../f1/StartingGantry';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen pt-28 pb-16 flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Brutalist Grid Background Overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Giant Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
        <h2 className="text-[22vw] font-black font-syne leading-none tracking-tighter">
          LIGHTS OUT
        </h2>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* F1 Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#e10600] uppercase bg-[#e10600]/10 px-3 py-1 border border-[#e10600]/30">
              FORMULA 1 ARCHIVE // EDITION 2026
            </span>
            <span className="text-[9px] font-mono tracking-[0.25em] text-white/50 uppercase px-3 py-1 bg-white/5 border border-white/10">
              ROUND 24 / ABU DHABI GP
            </span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.9] font-syne tracking-tighter uppercase text-white">
            IT'S LIGHTS OUT <br />
            <span className="text-[#e10600] inline-block mt-2">
              AND AWAY WE GO
            </span>
          </h1>

          <p className="text-white/60 text-xs sm:text-base font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            Competición técnica de Fórmula 1 de nueva generación. Desafía el motor procedural sin preguntas repetidas, descubre leyendas en telemetría pura y geolocaliza curvas en vistas a pie de pista.
          </p>

          {/* Real Interactive F1 Starting Gantry */}
          <StartingGantry />

          {/* Quick Access Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => navigate('/f1-real')}
              className="px-6 py-4 bg-[#e10600] hover:bg-red-700 text-white font-bold text-[9px] font-mono tracking-[0.25em] uppercase transition-all flex items-center gap-2 shadow-xl shadow-red-900/30 cursor-pointer"
            >
              <Radio size={13} className="text-white animate-pulse" />
              <span>F1 Real Live</span>
            </button>

            <button
              onClick={() => navigate('/quiz')}
              className="px-6 py-4 bg-white text-black font-bold text-[9px] font-mono tracking-[0.25em] uppercase hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <Zap size={13} className="fill-black" />
              <span>Quiz Master</span>
            </button>

            <button
              onClick={() => navigate('/driverle')}
              className="px-6 py-4 bg-[#141414] hover:bg-[#1a1a1a] text-white font-bold text-[9px] font-mono tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Target size={13} className="text-[#00d2be]" />
              <span>Driverle</span>
            </button>

            <button
              onClick={() => navigate('/circuits')}
              className="px-6 py-4 bg-[#141414] hover:bg-[#1a1a1a] text-white font-bold text-[9px] font-mono tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin size={13} className="text-[#fed100]" />
              <span>Circuit Apex</span>
            </button>

            <button
              onClick={() => navigate('/standings')}
              className="px-6 py-4 bg-[#141414] hover:bg-[#1a1a1a] text-white font-bold text-[9px] font-mono tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trophy size={13} className="text-[#e10600]" />
              <span>Standings</span>
            </button>
          </div>

          {/* Live Telemetry Ticker Ribbon */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-[8px] sm:text-[9px] font-mono text-white/40 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>TELEMETRY FEED: <strong>ACTIVE</strong></span>
            </div>
            <div>
              TOP SPEED: <strong className="text-white">354.8 KM/H</strong>
            </div>
            <div>
              FASTEST PIT STOP: <strong className="text-white">1.80s</strong>
            </div>
            <div>
              TYRE COMPOUND: <strong className="text-[#e10600]">SOFT (C5)</strong>
            </div>
            <div>
              DRS ZONES: <strong className="text-emerald-400">ENABLED</strong>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        className="mt-10 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => {
          const el = document.getElementById('quiz-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else navigate('/quiz');
        }}
      >
        <span className="text-[7px] font-mono font-bold tracking-[0.3em] text-white/20 uppercase">
          EXPLORE PADDOCK
        </span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
