import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Zap, Target, MapPin, Trophy, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export const TabBar: React.FC = () => {
  const tabs = [
    { to: '/', label: 'PADDOCK', icon: LayoutGrid, accent: '#ffffff' },
    { to: '/f1-real', label: 'F1 REAL LIVE', icon: Radio, pulse: true, accent: '#e10600' },
    { to: '/quiz', label: 'QUIZ MASTER', icon: Zap, accent: '#ffffff' },
    { to: '/driverle', label: 'DRIVERLE', icon: Target, accent: '#00d2be' },
    { to: '/circuits', label: 'CIRCUIT APEX', icon: MapPin, accent: '#fed100' },
    { to: '/standings', label: 'STANDINGS', icon: Trophy, accent: '#e10600' },
  ];

  return (
    <div className="w-full bg-[#050505]/90 backdrop-blur-md border-b border-white/10 sticky top-[72px] lg:top-[80px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-[10px] font-f1 tracking-[0.12em] uppercase transition-all whitespace-nowrap rounded-xs relative ${
                    isActive
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5 bg-transparent'
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
                          : (isActive ? 'text-black' : 'text-white/60')
                      }
                    />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e10600]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
