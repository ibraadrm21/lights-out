import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Radio, Trophy, Zap, Target, MapPin, ArrowRight } from 'lucide-react';
import { F1_DRIVERS, F1_CONSTRUCTORS, F1_TRACK_CORNERS as F1_TRACKS } from '../../data/f1Data';
import { CountryFlagSvg } from '../common/F1Icons';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'DRIVERS' | 'TEAMS' | 'CIRCUITS' | 'MODES'>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Mode entries
  const modes = [
    { id: 'f1-real', name: 'OpenF1 Live Telemetry & Mundial', category: 'MODES', icon: Radio, desc: 'Clasificación del mundial de pilotos, constructores y último GP' },
    { id: 'quiz', name: 'Quiz Master F1', category: 'MODES', icon: Zap, desc: 'Desafíos de aerodinámica, motores híbridos y estrategia' },
    { id: 'driverle', name: 'Driverle Detective', category: 'MODES', icon: Target, desc: 'Adivina el piloto misterioso con pistas técnicas' },
    { id: 'circuits', name: 'Circuit Apex Recognition', category: 'MODES', icon: MapPin, desc: 'Identifica la curva y trazado por telemetría' },
    { id: 'leaderboard', name: 'Global Paddock Standings', category: 'MODES', icon: Trophy, desc: 'Ranking mundial de pilotos y operadores' },
  ];

  const filteredModes = modes.filter(m => 
    selectedFilter === 'ALL' || selectedFilter === 'MODES'
  ).filter(m => !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));

  const filteredDrivers = F1_DRIVERS.filter(() => 
    selectedFilter === 'ALL' || selectedFilter === 'DRIVERS'
  ).filter(d => 
    !q || 
    d.name.toLowerCase().includes(q) || 
    d.team.toLowerCase().includes(q) || 
    d.country.toLowerCase().includes(q) ||
    d.number.toString().includes(q)
  );

  const filteredTeams = F1_CONSTRUCTORS.filter(() => 
    selectedFilter === 'ALL' || selectedFilter === 'TEAMS'
  ).filter(t => 
    !q || 
    t.name.toLowerCase().includes(q) || 
    t.code.toLowerCase().includes(q) || 
    t.engine.toLowerCase().includes(q)
  );

  const filteredCircuits = F1_TRACKS.filter(() => 
    selectedFilter === 'ALL' || selectedFilter === 'CIRCUITS'
  ).filter(c => 
    !q || 
    c.trackName.toLowerCase().includes(q) || 
    c.cornerName.toLowerCase().includes(q) || 
    c.country.toLowerCase().includes(q)
  );

  const navigate = useNavigate();

  const handleNavigate = (id: string) => {
    onClose();
    const routeMap: Record<string, string> = {
      'f1-real': '/f1-real',
      'quiz': '/quiz',
      'driverle': '/driverle',
      'circuits': '/circuits',
      'leaderboard': '/standings',
    };
    if (routeMap[id]) {
      navigate(routeMap[id]);
    } else {
      navigate('/');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-black/98 backdrop-blur-2xl text-white">
        {/* Grain overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/10">
          <div className="text-xl font-black font-syne italic tracking-tighter">
            PADDOCK<span className="text-[#e10600]">_SEARCH</span>
          </div>
          <button 
            onClick={onClose}
            className="group p-2.5 border border-white/10 hover:border-white/40 transition-all flex items-center justify-center cursor-pointer"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        {/* Search Input Area */}
        <div className="w-full max-w-4xl mx-auto px-6 pt-10 flex-1 flex flex-col overflow-hidden">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH PILOTS, TEAMS, CIRCUITS OR SESSIONS..."
              className="w-full bg-white/5 border-b-2 border-white/10 py-5 pl-14 pr-6 text-lg sm:text-2xl font-bold font-mono tracking-wider uppercase focus:outline-none focus:border-[#e10600] transition-all placeholder:text-white/20"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(['ALL', 'MODES', 'DRIVERS', 'TEAMS', 'CIRCUITS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 text-[9px] font-mono font-bold tracking-widest uppercase transition-all ${
                  selectedFilter === filter
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Results Container */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-2">
            {/* Modes Section */}
            {filteredModes.length > 0 && (
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-[#e10600] uppercase block mb-3 font-bold">
                  TELEMETRY SECTIONS & MODES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredModes.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleNavigate(m.id)}
                        className="text-left p-4 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all flex items-start gap-4 group"
                      >
                        <div className="p-2 bg-white/5 border border-white/10 text-white group-hover:text-[#e10600] transition-colors">
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase group-hover:text-[#e10600] transition-colors">
                            {m.name}
                          </h4>
                          <p className="text-[9px] font-mono text-white/40 mt-1 line-clamp-1">
                            {m.desc}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-white/20 group-hover:text-white transition-colors self-center" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drivers Section */}
            {filteredDrivers.length > 0 && (
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase block mb-3 font-bold">
                  PILOTS // ARCHIVE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDrivers.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleNavigate('driverle')}
                      className="cursor-pointer p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all flex items-center gap-3.5"
                    >
                      <img src={d.image} alt={d.name} className="w-10 h-10 object-cover bg-neutral-900 border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-[#e10600]">#{d.number}</span>
                          <span className="text-xs font-mono font-bold uppercase truncate text-white">{d.name}</span>
                          <CountryFlagSvg code={d.flag} width={14} height={10} />
                        </div>
                        <span className="text-[9px] font-mono text-white/40 uppercase block truncate">{d.team}</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/30">{d.podiums} Podiums</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Section */}
            {filteredTeams.length > 0 && (
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase block mb-3 font-bold">
                  CONSTRUCTORS // TEAMS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTeams.map((t) => (
                    <div
                      key={t.code}
                      onClick={() => handleNavigate('f1-real')}
                      className="cursor-pointer p-3.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between"
                      style={{ borderLeftColor: t.color, borderLeftWidth: '3px' }}
                    >
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase">{t.name}</h4>
                        <span className="text-[9px] font-mono text-white/40 uppercase">{t.engine}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white/40">{t.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Circuits Section */}
            {filteredCircuits.length > 0 && (
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase block mb-3 font-bold">
                  CIRCUITS // CORNERS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredCircuits.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleNavigate('circuits')}
                      className="cursor-pointer p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all flex items-center gap-3"
                    >
                      <img src={c.image} alt={c.trackName} className="w-12 h-9 object-cover bg-neutral-900 border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono font-bold text-white uppercase block truncate">{c.trackName}</span>
                        <span className="text-[9px] font-mono text-[#fed100] uppercase block">{c.cornerName} ({c.turnNumber})</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 uppercase">{c.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredModes.length === 0 && filteredDrivers.length === 0 && filteredTeams.length === 0 && filteredCircuits.length === 0 && (
              <div className="py-20 text-center font-mono text-xs text-white/30 uppercase">
                NO TELEMETRY RECORD MATCHING "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default SearchOverlay;
