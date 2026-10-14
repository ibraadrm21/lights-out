import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Radio, Zap, Target, MapPin, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import ProfileModal from './ProfileModal';

const MobileNav: React.FC = () => {
  const { currentUser, coins } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Live F1</span>
          </NavLink>

          {/* Quiz */}
          <NavLink 
            to="/quiz" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`}
          >
            <Zap size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Quiz</span>
          </NavLink>

          {/* Driverle */}
          <NavLink 
            to="/driverle" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-[#00d2be]' : 'text-white/50 hover:text-white'}`}
          >
            <Target size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Driverle</span>
          </NavLink>

          {/* Circuits */}
          <NavLink 
            to="/circuits" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-[#fed100]' : 'text-white/50 hover:text-white'}`}
          >
            <MapPin size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Apex</span>
          </NavLink>

          {/* Standings */}
          <NavLink 
            to="/standings" 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-1.5 transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`}
          >
            <Trophy size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">Ranks</span>
          </NavLink>

          {/* Pilot Profile */}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-white/50 hover:text-white transition-colors relative"
          >
            <User size={16} strokeWidth={2} />
            <span className="text-[7px] font-mono font-bold tracking-widest uppercase">
              🪙 {coins || 0}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pilot Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={currentUser} 
        initialTab="stats"
      />
    </>
  );
};

export default MobileNav;
