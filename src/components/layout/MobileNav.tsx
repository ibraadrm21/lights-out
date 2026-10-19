import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Home, Radio, Gamepad2, Trophy, User, X, 
  Zap, Target, Timer, Flame, Eye, MapPin, Compass, Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from './ProfileModal';
import { PitCoinIcon } from '../common/F1Icons';

const GAMES_LIST = [
  { to: '/daily', label: 'Daily Challenge', desc: 'Reto diario oficial con PitCoins', icon: Calendar, color: '#e10600' },
  { to: '/quiz', label: 'Quiz Master', desc: 'Trivia procedural multinivel', icon: Zap, color: '#facc15' },
  { to: '/driverle', label: 'Driverle', desc: 'Adivina el piloto misterioso', icon: Target, color: '#00d2be' },
  { to: '/reaction', label: 'Reaction Test', desc: 'Semáforo de salida oficial FIA', icon: Timer, color: '#e10600' },
  { to: '/higher-lower', label: 'Higher or Lower', desc: 'Duelo estadístico 1950-2026', icon: Flame, color: '#f97316' },
  { to: '/helmet-guess', label: 'HelmetGuess', desc: 'Reconocimiento de cascos reales', icon: Eye, color: '#38bdf8' },
  { to: '/circuits', label: 'Circuit GeoGuessr', desc: 'Trazados y telemetría de curvas', icon: MapPin, color: '#a855f7' },
];

const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { coins } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGamesSheetOpen, setIsGamesSheetOpen] = useState(false);
  const location = useLocation();

  const isAnyGameActive = GAMES_LIST.some(g => location.pathname === g.to);

  return (
    <>
      {/* Floating Bottom Nav */}
      <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-3 lg:hidden pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="pointer-events-auto w-full max-w-lg bg-black/85 backdrop-blur-2xl border border-white/10 rounded-full py-2.5 px-3 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,0.95)]"
        >
          {/* Top / Home */}
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`}
          >
            <Home size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Paddock</span>
          </NavLink>

          {/* F1 Real */}
          <NavLink 
            to="/f1-real" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-[#e10600]' : 'text-white/50 hover:text-white'}`}
          >
            <Radio size={16} strokeWidth={2} className="animate-pulse" />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">F1 Real</span>
          </NavLink>

          {/* Daily Challenge */}
          <NavLink 
            to="/daily" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-amber-400 font-bold' : 'text-amber-400/80 hover:text-amber-400'}`}
          >
            <Calendar size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Daily</span>
          </NavLink>

          {/* Games Menu Button */}
          <button 
            onClick={() => setIsGamesSheetOpen(true)}
            className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
              isAnyGameActive ? 'text-yellow-400 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Gamepad2 size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Games</span>
          </button>

          {/* Standings */}
          <NavLink 
            to="/standings" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`}
          >
            <Trophy size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Standings</span>
          </NavLink>

          {/* Pilot Profile */}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-white/50 hover:text-white transition-colors relative"
          >
            <User size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase flex items-center gap-1">
              <PitCoinIcon size={9} />
              <span>{coins || 0}</span>
            </span>
          </button>
        </motion.div>
      </div>

      {/* Games Bottom Sheet for Mobile */}
      <AnimatePresence>
        {isGamesSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGamesSheetOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-[#0d0d0d] border-t border-white/15 rounded-t-2xl p-5 pb-8 shadow-[0_-15px_40px_rgba(0,0,0,0.95)] max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={18} className="text-yellow-400" />
                  <span className="font-f1 text-sm font-bold tracking-widest text-white uppercase">MINIJUEGOS & ARCADE</span>
                </div>
                <button 
                  onClick={() => setIsGamesSheetOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GAMES_LIST.map((game) => {
                  const Icon = game.icon;
                  const isCurrent = location.pathname === game.to;
                  return (
                    <Link
                      key={game.to}
                      to={game.to}
                      onClick={() => setIsGamesSheetOpen(false)}
                      className={`flex items-center gap-3.5 p-3 rounded-lg border transition-all ${
                        isCurrent 
                          ? 'bg-white/15 border-white/30 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-white/80'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 shrink-0 rounded-md flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: `${game.color}20`, color: game.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-f1 font-bold uppercase tracking-wider text-white">
                          {game.label}
                        </span>
                        <span className="block text-[11px] font-mono text-white/50 truncate">
                          {game.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pilot Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        initialTab="stats"
      />
    </>
  );
};

export default MobileNav;

