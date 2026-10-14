import React from 'react';
import { F1_CONSTRUCTORS } from '../../data/f1Data';

const LogoLoop: React.FC = () => {
  return (
    <div className="pt-24 pb-16 relative group">
      {/* Self-contained CSS marquee for smooth 60fps GPU animation & hover pause */}
      <style>{`
        @keyframes f1MarqueeSlow {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .f1-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: f1MarqueeSlow 95s linear infinite;
          will-change: transform;
        }
        .f1-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Border and Loop Container */}
      <div className="bg-black border-y border-white/5 overflow-hidden py-10 relative">
        {/* Decorative Label - Glued to the top border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black border-x border-b border-white/10 px-4 py-1 z-20">
          <span className="text-[8px] font-mono font-bold tracking-[0.4em] text-white/40 uppercase whitespace-nowrap">
            ESCUDERÍAS Y TELEMETRÍA OFICIAL F1 // TEMPORADA 2026
          </span>
        </div>

        <div className="flex overflow-hidden">
          <div className="f1-marquee-track px-8">
            {/* Duplicated list for seamless infinite loop */}
            {[...F1_CONSTRUCTORS, ...F1_CONSTRUCTORS].map((team, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center px-8 group/item cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  {/* Team Racing Color Accent */}
                  <span
                    className="w-1.5 h-6 rounded-full transition-all duration-300 opacity-60 group-hover/item:opacity-100 group-hover/item:scale-y-125"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-black font-syne uppercase tracking-wider text-white/40 group-hover/item:text-white transition-colors duration-300">
                      {team.name}
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-white/20 group-hover/item:text-white/60 transition-colors">
                      {team.engine}
                    </span>
                  </div>
                </div>

                {/* Dot Separator */}
                <div className="w-1.5 h-1.5 bg-white/10 rounded-full ml-12 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilterLogo">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterLogo)" />
        </svg>
      </div>
    </div>
  );
};

export default LogoLoop;
