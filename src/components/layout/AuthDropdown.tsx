import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Settings, Trophy, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { InlineLoader } from '../common/Loader';
import { F1_CONSTRUCTORS } from '../../data/f1Data';

interface AuthDropdownProps {
  onClose: () => void;
  user: any;
  onOpenSettings: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

const AuthDropdown: React.FC<AuthDropdownProps> = ({ onClose, onOpenSettings }) => {
  const { user, profile, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Scuderia Ferrari HP');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      addToast('SESIÓN DE PILOTO INICIADA CON ÉXITO', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'ERROR AL INICIAR SESIÓN', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        throw new Error('El nombre de piloto debe tener al menos 3 caracteres alfanuméricos.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: username.trim(),
            favorite_team: selectedTeam,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        addToast('REGISTRO COMPLETADO. BIENVENIDO AL PADDOCK.', 'success');
      } else {
        addToast('REGISTRO EXITOSO. VERIFICA TU CORREO ELECTRÓNICO.', 'info');
      }
      onClose();
    } catch (err: any) {
      addToast(err.message || 'ERROR AL REGISTRAR CUENTA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      setResetSent(true);
      addToast('ENLACE DE RECUPERACIÓN ENVIADO AL CORREO', 'info');
    } catch (err: any) {
      addToast(err.message || 'NO SE PUDO ENVIAR EL CORREO DE RECUPERACIÓN', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    addToast('SESIÓN DE PILOTO FINALIZADA', 'info');
    onClose();
  };

  if (user) {
    return (
      <div className="p-6 min-w-[260px] bg-[#0c0c12] border border-white/10 text-white shadow-2xl">
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-white/10">
          <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center shrink-0">
            <UserIcon size={18} className="text-[#FF1E00]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[8px] font-mono font-bold tracking-[0.3em] text-white/50 block uppercase">
              {profile?.role === 'admin' ? 'FIA STEWARD // ADMIN' : 'FIA SUPER LICENSE'}
            </span>
            <span className="text-xs font-bold font-syne text-white truncate block">
              {profile?.display_name || profile?.username || user.email?.split('@')[0]}
            </span>
            <span className="text-[9px] font-mono text-white/40 truncate block mt-0.5">
              {profile?.favorite_team || 'Lights Out Racing'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-mono font-bold tracking-widest uppercase text-white"
          >
            <div className="flex items-center space-x-2.5">
              <Settings size={14} className="text-white/60" />
              <span>Ajustes de Piloto</span>
            </div>
            <Trophy size={12} className="text-[#fed100]" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-[10px] font-mono font-bold tracking-widest uppercase text-white/70 hover:text-red-400 group"
          >
            <LogOut size={13} className="group-hover:text-red-400 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 min-w-[320px] max-w-[360px] bg-[#0e0e14] border border-white/10 text-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[8px] font-mono tracking-[0.3em] text-[#FF1E00] uppercase block font-bold">
            PADDOCK TELEMETRY
          </span>
          <h3 className="text-lg font-black font-syne tracking-tight uppercase">
            {mode === 'login' && 'INICIAR SESIÓN'}
            {mode === 'register' && 'CREAR CUENTA'}
            {mode === 'forgot_password' && 'RECUPERAR CLAVE'}
          </h3>
        </div>
        {mode !== 'login' && (
          <button 
            onClick={() => { setMode('login'); setResetSent(false); }}
            className="text-white/40 hover:text-white p-1 transition-colors"
            title="Volver"
          >
            <ArrowLeft size={16} />
          </button>
        )}
      </div>

      {/* Mode: Login */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="piloto@lightsout.f1"
              className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setMode('forgot_password')}
                className="text-[8px] font-mono text-white/40 hover:text-[#FF1E00] transition-colors uppercase tracking-wider"
              >
                ¿Olvidaste?
              </button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono font-bold text-[10px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50 mt-4 flex items-center justify-center min-h-[40px] cursor-pointer"
          >
            {loading ? <InlineLoader label="AUTENTICANDO" size={12} /> : 'INGRESAR AL PADDOCK'}
          </button>
        </form>
      )}

      {/* Mode: Register */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
              Callsign / Piloto
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: Senna_88"
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
              required
            />
          </div>
          <div>
            <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="piloto@lightsout.f1"
              className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
              required
            />
          </div>
          <div>
            <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
              required
            />
          </div>
          <div>
            <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
              Escudería Favorita
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
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
            disabled={loading}
            className="w-full py-3 bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono font-bold text-[10px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50 mt-3 flex items-center justify-center min-h-[40px] cursor-pointer"
          >
            {loading ? <InlineLoader label="CREANDO CUENTA" size={12} /> : 'REGISTRAR SUPER LICENCIA'}
          </button>
        </form>
      )}

      {/* Mode: Forgot Password */}
      {mode === 'forgot_password' && (
        <div className="space-y-4">
          {resetSent ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Mail size={16} />
                <span>CORREO ENVIADO</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                Revisa tu bandeja de entrada en <span className="text-white font-bold">{email}</span> y pulsa el enlace para crear tu nueva contraseña.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-[10px] font-mono text-white/60 leading-relaxed">
                Introduce tu correo electrónico para recibir un enlace oficial de restablecimiento de contraseña.
              </p>
              <div>
                <label className="text-[8px] font-mono font-bold tracking-[0.25em] text-white/50 uppercase block mb-1">
                  Correo Electrónico
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="piloto@lightsout.f1"
                  className="w-full bg-white/5 border border-white/10 py-2.5 px-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono font-bold text-[10px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50 mt-4 flex items-center justify-center min-h-[40px] cursor-pointer"
              >
                {loading ? <InlineLoader label="ENVIANDO" size={12} /> : 'ENVIAR ENLACE'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Footer Switcher */}
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        {mode === 'login' && (
          <button 
            onClick={() => setMode('register')}
            className="text-[9px] font-mono font-bold tracking-[0.15em] text-white/40 hover:text-white uppercase transition-colors"
          >
            ¿No tienes cuenta? <span className="text-[#FF1E00]">Crear Identidad</span>
          </button>
        )}
        {mode === 'register' && (
          <button 
            onClick={() => setMode('login')}
            className="text-[9px] font-mono font-bold tracking-[0.15em] text-white/40 hover:text-white uppercase transition-colors"
          >
            ¿Ya registrado? <span className="text-white">Iniciar Sesión</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthDropdown;
