import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../store/useToast';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { InlineLoader } from '../components/common/Loader';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check session or recovery event if needed
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('LAS CONTRASEÑAS NO COINCIDEN', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      addToast('CONTRASEÑA ACTUALIZADA CON ÉXITO', 'success');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      addToast(err.message || 'ERROR AL RESTABLECER LA CONTRASEÑA', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#15151E] text-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md bg-[#0e0e14] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        {/* F1 decorative red top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF1E00]" />

        <div className="mb-6">
          <span className="text-[9px] font-mono tracking-[0.3em] text-[#FF1E00] uppercase font-bold block mb-1">
            FIA SECURITY PROTOCOL
          </span>
          <h1 className="text-2xl font-black font-syne uppercase tracking-tight">
            NUEVA CONTRASEÑA
          </h1>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} />
              <span className="font-syne font-bold text-sm tracking-wider uppercase">
                CLAVE ACTUALIZADA
              </span>
            </div>
            <p className="text-xs font-mono text-white/80 leading-relaxed">
              Tu contraseña de acceso a Lights Out se ha actualizado correctamente. Te estamos redirigiendo al Paddock...
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase bg-white/10 hover:bg-white/20 px-4 py-2 border border-white/20 transition-colors"
            >
              <span>Ir al Paddock ahora</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="w-full bg-white/5 border border-white/10 py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <Lock size={14} className="absolute right-3.5 top-3.5 text-white/30" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  minLength={6}
                  required
                  className="w-full bg-white/5 border border-white/10 py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-[#FF1E00] focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <Lock size={14} className="absolute right-3.5 top-3.5 text-white/30" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase transition-colors disabled:opacity-50 mt-6 flex items-center justify-center cursor-pointer"
            >
              {loading ? <InlineLoader label="ACTUALIZANDO" size={14} /> : 'GUARDAR NUEVA CLAVE'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
