import React, { useState, useEffect, useRef } from 'react';
import { Search, User, LayoutGrid, Radio, Zap, Target, MapPin, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import AuthDropdown from './AuthDropdown';
import ProfileModal from './ProfileModal';
import SearchOverlay from './SearchOverlay';

const navTabs = [
  { to: '/', label: 'PADDOCK', icon: LayoutGrid, exact: true },
  { to: '/f1-real', label: 'F1 REAL LIVE', icon: Radio, pulse: true },
  { to: '/quiz', label: 'QUIZ MASTER', icon: Zap },
  { to: '/driverle', label: 'DRIVERLE', icon: Target },
  { to: '/circuits', label: 'CIRCUITS', icon: MapPin },
  { to: '/standings', label: 'STANDINGS', icon: Trophy },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setCurrentUser, currentUser, coins } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'stats' | 'security'>('stats');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAuthOpen(false);
      }
    };
    if (isAuthOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthOpen]);

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
          
          {/* Center: Unified F1 Tabs */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink 
                  key={tab.to} 
                  to={tab.to} 
                  end={tab.exact}
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3.5 py-1.5 text-[10px] font-f1 tracking-[0.12em] uppercase transition-all rounded-xs relative whitespace-nowrap ${
                      isActive 
                        ? 'bg-white text-black shadow-md font-bold' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        size={12} 
                        className={
                          tab.pulse 
                            ? (isActive ? 'text-black' : 'text-[#e10600] animate-pulse') 
                            : (isActive ? 'text-black' : 'text-white/50')
                        } 
                      />
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right Side: Coins & Icons */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Coins Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-white/10 rounded-sm">
              <span className="text-xs">🪙</span>
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
