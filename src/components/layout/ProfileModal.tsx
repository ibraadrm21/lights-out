import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, User, Zap, Target, MapPin, Award, Shield, Save, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { InlineLoader } from '../common/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { PitCoinIcon } from '../common/F1Icons';
import { F1_CONSTRUCTORS } from '../../data/f1Data';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  initialTab?: 'stats' | 'profile' | 'security';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'stats' }) => {
  const { addToast } = useToast();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'security'>(initialTab);

  // Profile edit state
  const [displayName, setDisplayName] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('Scuderia Ferrari HP');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.username || '');
      setFavoriteTeam(profile.favorite_team || 'Scuderia Ferrari HP');
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('DEBES INICIAR SESIÓN PARA GUARDAR TU PERFIL', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        favorite_team: favoriteTeam,
      });
      if (error) throw error;
      addToast('PERFIL DE PILOTO ACTUALIZADO', 'success');
    } catch (err: any) {
      addToast(err.message || 'ERROR AL ACTUALIZAR PERFIL', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('LAS CONTRASEÑAS NO COINCIDEN', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      addToast('CONTRASEÑA ACTUALIZADA CON ÉXITO', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'ERROR AL ACTUALIZAR CONTRASEÑA', 'error');
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
            className="fixed inset-4 md:inset-0 md:m-auto w-auto md:w-full md:max-w-3xl h-fit max-h-[92vh] md:h-[520px] bg-[#0c0c14] border border-white/10 shadow-2xl z-[110] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-[120]"
            >
              <X size={20} />
            </button>

            {/* Left Sidebar */}
            <div className="w-full md:w-2/5 bg-[#08080c] border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                    <User size={20} className="text-[#FF1E00]" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[7px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-0.5 font-mono">
                      {profile?.role === 'admin' ? 'FIA STEWARD' : 'FIA SUPER LICENSE'}
                    </span>
                    <span className="text-xs font-bold text-white truncate block font-syne uppercase">
                      {profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'INVITADO'}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 truncate block mt-0.5">
                      @{profile?.username || 'guest_pilot'}
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
                    <span>Telemetría</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center space-x-3 px-4 py-3 border transition-all text-[9px] font-bold tracking-[0.2em] uppercase font-mono ${
                      activeTab === 'profile'
                        ? 'bg-white text-black border-white'
                        : 'border-white/5 hover:border-white/15 bg-white/0 text-white/50 hover:text-white'
                    }`}
                  >
                    <User size={13} />
                    <span>Datos de Piloto</span>
                  </button>

                  {user && (
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`flex items-center space-x-3 px-4 py-3 border transition-all text-[9px] font-bold tracking-[0.2em] uppercase font-mono ${
                        activeTab === 'security'
                          ? 'bg-white text-black border-white'
                          : 'border-white/5 hover:border-white/15 bg-white/0 text-white/50 hover:text-white'
                      }`}
                    >
                      <Key size={13} />
                      <span>Seguridad</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[7px] font-mono tracking-[0.3em] text-white/30 uppercase block">
                    ESTADO DEL ENLACE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold mt-0.5 block flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{user ? 'CONECTADO A SUPABASE' : 'MODO INVITADO (LOCAL)'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between bg-[#0e0e16]">
              <div>
                <h3 className="text-xl font-black font-syne tracking-tighter italic uppercase text-white mb-1">
                  {activeTab === 'stats' && 'TELEMETRÍA & PUNTUACIÓN'}
                  {activeTab === 'profile' && 'AJUSTES DE PILOTO'}
                  {activeTab === 'security' && 'SEGURIDAD & CREDENCIALES'}
                </h3>
                <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase mb-6">
                  {activeTab === 'stats' && 'Métricas oficiales, balance de PitCoins y progreso'}
                  {activeTab === 'profile' && 'Personaliza tu identidad en el Paddock'}
                  {activeTab === 'security' && 'Actualiza tu contraseña oficial de acceso'}
                </p>

                {/* Tab: Stats */}
                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    {/* Points balance */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                          SALDO OFICIAL PITCOINS
                        </span>
                        <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
                          <PitCoinIcon size={22} />
                          <span>{(profile?.pitcoins ?? 1250).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                        {user ? 'Sincronizado' : 'Local'}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white/[0.02] border border-white/5">
                        <Zap size={14} className="text-[#FF1E00] mb-2" />
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

                    <div className="p-4 border border-white/5 bg-white/[0.01] text-[9px] font-mono text-white/50 uppercase leading-relaxed">
                      Escudería asociada: <span className="text-white font-bold">{profile?.favorite_team || 'Scuderia Ferrari HP'}</span>. Las recompensas obtenidas en los minijuegos se protegen mediante firmas criptográficas en la base de datos de Supabase.
                    </div>
                  </div>
                )}

                {/* Tab: Profile Edit */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm">
                    <div>
                      <label className="text-[8px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1">
                        Nombre Público en Paddock
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre de piloto"
                        maxLength={30}
                        required
                        className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1">
                        Escudería Favorita
                      </label>
                      <select
                        value={favoriteTeam}
                        onChange={(e) => setFavoriteTeam(e.target.value)}
                        className="w-full bg-[#121218] border border-white/10 py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00]"
                      >
                        {F1_CONSTRUCTORS.map((team) => (
                          <option key={team.name} value={team.name}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile || !user}
                      className="px-6 py-3 bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono font-bold text-[9px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {savingProfile ? <InlineLoader label="GUARDANDO" size={12} /> : (
                        <>
                          <Save size={13} />
                          <span>GUARDAR CAMBIOS</span>
                        </>
                      )}
                    </button>
                    {!user && (
                      <p className="text-[9px] font-mono text-amber-400 mt-2">
                        Inicia sesión para sincronizar tu perfil de piloto en la nube.
                      </p>
                    )}
                  </form>
                )}

                {/* Tab: Security */}
                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                    <div>
                      <label className="text-[8px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="px-6 py-3 bg-white text-black font-mono font-bold text-[9px] tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer"
                    >
                      {updatingPassword ? <InlineLoader label="ACTUALIZANDO" size={12} /> : 'ACTUALIZAR CONTRASEÑA'}
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
