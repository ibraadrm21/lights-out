import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, User, LayoutGrid, Radio, Trophy, Gamepad2, 
  ChevronDown, Zap, Target, Timer, Flame, Eye, MapPin, Compass 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import AuthDropdown from './AuthDropdown';
import ProfileModal from './ProfileModal';
import SearchOverlay from './SearchOverlay';
import { PitCoinIcon } from '../common/F1Icons';

const GAMES_LIST = [
  { to: '/strategy', label: 'Strategy Master', desc: 'Gana la carrera desde el muro de boxes', icon: Compass, color: '#e10600' },
  { to: '/quiz', label: 'Quiz Master', desc: 'Trivia procedural multinivel', icon: Zap, color: '#facc15' },
  { to: '/driverle', label: 'Driverle', desc: 'Adivina el piloto misterioso', icon: Target, color: '#00d2be' },
  { to: '/reaction', label: 'Reaction Test', desc: 'Semáforo de salida oficial FIA', icon: Timer, color: '#e10600' },
  { to: '/higher-lower', label: 'Higher or Lower', desc: 'Duelo estadístico 1950-2026', icon: Flame, color: '#f97316' },
  { to: '/helmet-guess', label: 'HelmetGuess', desc: 'Reconocimiento de cascos reales', icon: Eye, color: '#38bdf8' },
  { to: '/circuits', label: 'Circuit GeoGuessr', desc: 'Trazados y telemetría de curvas', icon: MapPin, color: '#a855f7' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setCurrentUser, currentUser, coins } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'stats' | 'security'>('stats');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gamesDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isAnyGameActive = GAMES_LIST.some(g => location.pathname === g.to);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAuthOpen(false);
      }
      if (gamesDropdownRef.current && !gamesDropdownRef.current.contains(event.target as Node)) {
        setIsGamesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close games dropdown on route change
  useEffect(() => {
    setIsGamesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 py-3 transition-all duration-300"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 relative">
          {/* Left Side: Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-white font-syne italic shrink-0">
            LIGHTS<span className="text-[#e10600]">OUT</span>
          </Link>
          
          {/* Center: Simplified Clean Navigation: PADDOCK, F1 REAL, GAMES (Dropdown), STANDINGS */}
          <div className="hidden lg:flex items-center gap-2">
            {/* 1. PADDOCK */}
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 text-[11px] font-f1 tracking-[0.14em] uppercase transition-all rounded-xs relative whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-black shadow-md font-bold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutGrid size={13} className={isActive ? 'text-black' : 'text-white/60'} />
                  <span>PADDOCK</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]" />}
                </>
              )}
            </NavLink>

            {/* 2. F1 REAL */}
            <NavLink 
              to="/f1-real" 
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 text-[11px] font-f1 tracking-[0.14em] uppercase transition-all rounded-xs relative whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-black shadow-md font-bold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Radio size={13} className={isActive ? 'text-black' : 'text-[#e10600] animate-pulse'} />
                  <span>F1 REAL</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]" />}
                </>
              )}
            </NavLink>

            {/* 3. GAMES (Dropdown Menu) */}
            <div className="relative" ref={gamesDropdownRef}>
              <button
                onClick={() => setIsGamesOpen(!isGamesOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] font-f1 tracking-[0.14em] uppercase transition-all rounded-xs relative whitespace-nowrap cursor-pointer ${
                  isAnyGameActive
                    ? 'bg-white text-black shadow-md font-bold'
                    : isGamesOpen
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gamepad2 size={14} className={isAnyGameActive ? 'text-black' : 'text-yellow-400'} />
                <span>GAMES</span>
                <ChevronDown 
                  size={12} 
                  className={`transition-transform duration-200 ${isGamesOpen ? 'rotate-180' : ''}`} 
                />
                {isAnyGameActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]" />}
              </button>

              {/* Games Dropdown Panel */}
              <AnimatePresence>
                {isGamesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-[#0c0c0c] border border-white/15 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.95)] p-2 z-50 divide-y divide-white/5"
                  >
                    <div className="px-2 py-1.5 text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center justify-between">
                      <span>MINIJUEGOS & DESAFÍOS</span>
                      <span className="text-yellow-400 font-bold">7 JUEGOS</span>
                    </div>

                    <div className="pt-1 space-y-1">
                      {GAMES_LIST.map((game) => {
                        const Icon = game.icon;
                        const isCurrent = location.pathname === game.to;
                        return (
                          <Link
                            key={game.to}
                            to={game.to}
                            onClick={() => setIsGamesOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-xs transition-all ${
                              isCurrent
                                ? 'bg-white/15 text-white'
                                : 'hover:bg-white/5 text-white/80 hover:text-white'
                            }`}
                          >
                            <div 
                              className="w-7 h-7 shrink-0 rounded-xs flex items-center justify-center border border-white/10"
                              style={{ backgroundColor: `${game.color}15`, color: game.color }}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs font-syne font-bold uppercase tracking-wide truncate">
                                {game.label}
                              </span>
                              <span className="block text-[10px] font-mono text-white/40 truncate">
                                {game.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. STANDINGS */}
            <NavLink 
              to="/standings" 
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 text-[11px] font-f1 tracking-[0.14em] uppercase transition-all rounded-xs relative whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-black shadow-md font-bold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Trophy size={13} className={isActive ? 'text-black' : 'text-white/60'} />
                  <span>STANDINGS</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]" />}
                </>
              )}
            </NavLink>
          </div>

          {/* Right Side: Coins & Icons */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Coins Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-white/10 rounded-sm">
              <PitCoinIcon size={14} />
              <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                {coins?.toLocaleString() ?? 0}
              </span>
            </div>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-white/70 hover:text-white transition-colors"
              title="Buscar en F1"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                className={`transition-colors ${isAuthOpen || currentUser ? 'text-white' : 'text-white/70 hover:text-white'}`}
                title="Perfil de Piloto"
              >
                <User size={18} strokeWidth={1.5} />
              </button>

              <AnimatePresence>
                {isAuthOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute right-0 top-full mt-4 bg-[#0a0a0a] border border-white/10 shadow-2xl z-[60] overflow-hidden"
                  >
                    <AuthDropdown 
                      user={currentUser} 
                      onClose={() => setIsAuthOpen(false)} 
                      onOpenSettings={() => {
                        setProfileModalTab('stats');
                        setIsSettingsOpen(true);
                        setIsAuthOpen(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <ProfileModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={currentUser} 
        initialTab={profileModalTab}
      />

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;
