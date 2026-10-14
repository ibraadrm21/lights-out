import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-white/5 bg-black">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-xl font-black font-syne italic">
          LIGHTS<span className="text-[#e10600]">OUT</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-[9px] font-mono tracking-widest text-white/40 uppercase">
          <Link to="/" className="hover:text-white transition-colors">Paddock Home</Link>
          <Link to="/f1-real" className="hover:text-white transition-colors">F1 Real Live</Link>
          <Link to="/quiz" className="hover:text-white transition-colors">Quiz Master</Link>
          <Link to="/driverle" className="hover:text-white transition-colors">Driverle</Link>
          <Link to="/circuits" className="hover:text-white transition-colors">Circuit Apex</Link>
          <Link to="/standings" className="hover:text-white transition-colors">Standings</Link>
        </div>
        <div className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
          © 2026 LIGHTS OUT ARCHIVE. FIA TELEMETRY FEED.
        </div>
      </div>
    </footer>
  );
};
