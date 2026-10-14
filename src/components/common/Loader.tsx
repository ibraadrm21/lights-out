import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PageLoaderProps {
  label?: string;
  subLabel?: string;
}

const terminalLines = [
  'CONNECTING TO FIA TELEMETRY CORE...',
  'SYNCHRONIZING PADDOCK PROTOCOLS...',
  'CHECKING SENSOR CHECKSUMS...',
  'FETCHING TIMING DATA STREAMS...',
  'ESTABLISHING PIT-TO-CAR RADIO LINK...',
  'LIGHTS OUT AND AWAY WE GO...'
];

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  label = "INITIALIZING TELEMETRY", 
  subLabel = "CONNECTING TO PADDOCK ARCHIVE" 
}) => {
  const [dots, setDots] = useState('');
  const [terminalLine, setTerminalLine] = useState('CONNECTING TO FIA TELEMETRY CORE...');


  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    let lineIndex = 0;
    const terminalInterval = setInterval(() => {
      setTerminalLine(terminalLines[lineIndex]);
      lineIndex = (lineIndex + 1) % terminalLines.length;
    }, 1200);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(terminalInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Brutalist Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.02))] bg-[size:100%_4px] pointer-events-none" />

      {/* Main Loader Frame */}
      <div className="w-full max-w-sm flex flex-col items-stretch relative z-10">
        
        {/* Subtle Nonchalant Rotating Brutalist Box */}
        <div className="flex justify-center mb-10">
          <motion.div
            animate={{
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ["0%", "20%", "40%", "20%", "0%"],
              scale: [1, 0.9, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="w-10 h-10 border border-white/20 flex items-center justify-center bg-white/[0.02] relative"
          >
            <motion.div 
              animate={{ 
                scale: [0.5, 0.8, 0.5],
                opacity: [0.3, 0.7, 0.3] 
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-4 h-4 bg-white"
            />
          </motion.div>
        </div>

        {/* Labels */}
        <div className="text-center space-y-2 mb-6">
          <div className="text-[10px] font-bold tracking-[0.5em] text-white/30 uppercase">
            {label}
          </div>
          <h2 className="text-sm font-black font-syne italic tracking-tighter uppercase text-white flex justify-center items-center gap-1">
            <span>{subLabel}</span>
            <span className="w-12 text-left font-mono">{dots}</span>
          </h2>
        </div>

        {/* Loading Bar Frame */}
        <div className="h-[2px] bg-white/10 w-full relative overflow-hidden mb-6">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: [0.65, 0, 0.35, 1]
            }}
            className="absolute top-0 bottom-0 w-1/3 bg-white"
          />
        </div>

        {/* Nonchalant Terminal Status Info */}
        <div className="h-6 flex items-center justify-center">
          <motion.p 
            key={terminalLine}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[8px] font-mono tracking-[0.2em] text-white/40 uppercase whitespace-nowrap"
          >
            {terminalLine}
          </motion.p>
        </div>
      </div>

      {/* Decorative Corner Borders */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/10" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/10" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/10" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/10" />
    </div>
  );
};

interface InlineLoaderProps {
  label?: string;
  size?: number;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  label, 
  size = 14 
}) => {
  return (
    <div className="inline-flex items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
        style={{ width: size, height: size }}
        className="border-2 border-white/10 border-t-white rounded-full flex-shrink-0"
      />
      {label && (
        <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
