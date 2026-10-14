import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, User, Zap, Target, MapPin, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { InlineLoader } from '../common/Loader';
import { useStore } from '../../store/useStore';
import { PitCoinIcon } from '../common/F1Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  initialTab?: 'stats' | 'security';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, initialTab = 'stats' }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'security'>(initialTab);
  const { coins } = useStore();

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Sync activeTab with initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('PASSWORDS DO NOT MATCH', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      addToast('PILOT PASSCODE UPDATED', 'success');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      addToast(err.message.toUpperCase(), 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-4 md:inset-0 md:m-auto w-auto md:w-full md:max-w-3xl h-fit max-h-[92vh] md:h-[480px] bg-[#070707] border border-white/10 shadow-2xl z-[110] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-[120]"
            >
              <X size={20} />
            </button>

            {/* Left Sidebar */}
            <div className="w-full md:w-2/5 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                    <User size={18} className="text-[#e10600]" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[7px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-0.5">
                      PILOT CALL SIGN
                    </span>
                    <span className="text-[10px] font-bold text-white truncate block tracking-widest font-mono">
                      {user?.email || 'GUEST_PILOT@F1.COM'}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex items-center space-x-3 px-4 py-3 border transition-all text-[9px] font-bold tracking-[0.2em] uppercase font-mono ${
                      activeTab === 'stats'
                        ? 'bg-white text-black border-white'
                        : 'border-white/5 hover:border-white/15 bg-white/0 text-white/50 hover:text-white'
                    }`}
                  >
                    <Award size={13} />
                    <span>Pilot Telemetry</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center space-x-3 px-4 py-3 border transition-all text-[9px] font-bold tracking-[0.2em] uppercase font-mono ${
                      activeTab === 'security'
                        ? 'bg-white text-black border-white'
                        : 'border-white/5 hover:border-white/15 bg-white/0 text-white/50 hover:text-white'
                    }`}
                  >
                    <Key size={13} />
                    <span>Passcode & Access</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <span className="text-[7px] font-mono tracking-[0.3em] text-white/20 uppercase block">
                  FIA SUPER LICENSE // LEVEL 01
                </span>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold mt-1 block">
                  TELEMETRY ONLINE
                </span>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col justify-between bg-black/50">
              <div>
                <h3 className="text-xl font-black font-syne tracking-tighter italic uppercase text-white mb-1">
                  {activeTab === 'stats' ? 'TELEMETRY PROFILE' : 'ACCESS SECURITY'}
                </h3>
                <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase mb-6">
                  {activeTab === 'stats' ? 'Official Paddock Driver Metrics & Achievements' : 'Configure Authentication Protocol'}
                </p>

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    {/* Points balance */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                          PADDOCK POINTS & COINS
                        </span>
                        <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
                          <PitCoinIcon size={22} />
                          <span>{coins.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                        Active Balance
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white/[0.02] border border-white/5">
                        <Zap size={14} className="text-[#e10600] mb-2" />
                        <span className="text-[7px] font-mono text-white/40 uppercase block">QUIZ</span>
                        <span className="text-xs font-mono font-bold text-white mt-1 block">MASTER</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5">
                        <Target size={14} className="text-[#00d2be] mb-2" />
                        <span className="text-[7px] font-mono text-white/40 uppercase block">DRIVERLE</span>
                        <span className="text-xs font-mono font-bold text-white mt-1 block">PILOT</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5">
                        <MapPin size={14} className="text-[#fed100] mb-2" />
                        <span className="text-[7px] font-mono text-white/40 uppercase block">CIRCUIT</span>
                        <span className="text-xs font-mono font-bold text-white mt-1 block">APEX</span>
                      </div>
                    </div>

                    <div className="p-4 border border-white/5 bg-white/[0.01] text-[9px] font-mono text-white/40 uppercase leading-relaxed">
                      Compete in daily challenges to unlock higher telemetry precision and earn spot recognition in the Global Standings.
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                    <div>
                      <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1.5 font-mono">
                        New Passcode
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-3 px-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1.5 font-mono">
                        Confirm Passcode
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-3 px-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="px-6 py-3.5 bg-white text-black font-bold text-[9px] font-mono tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center"
                    >
                      {updatingPassword ? <InlineLoader label="PROCESSING" size={12} /> : 'UPDATE PASSCODE'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
