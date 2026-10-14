import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { LogOut, User as UserIcon, Settings, Trophy } from 'lucide-react';
import { InlineLoader } from '../common/Loader';

interface AuthDropdownProps {
  onClose: () => void;
  user: any;
  onOpenSettings: () => void;
  onOpenOrders?: () => void;
}

const AuthDropdown: React.FC<AuthDropdownProps> = ({ onClose, user, onOpenSettings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast('AUTHENTICATION SUCCESSFUL', 'success');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        addToast('REGISTRATION SUCCESSFUL. CHECK YOUR EMAIL.', 'success');
      }
      onClose();
    } catch (err: any) {
      addToast(err.message.toUpperCase(), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast('SESSION TERMINATED', 'info');
    onClose();
  };

  if (user) {
    return (
      <div className="p-6 min-w-[240px]">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <UserIcon size={18} />
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[8px] font-bold tracking-[0.4em] text-white/40 block uppercase mb-0.5">Operator</span>
            <span className="text-[10px] font-bold text-white truncate block tracking-widest">{user.email}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link 
            to="/standings"
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-3 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold tracking-widest uppercase text-white"
          >
            <Trophy size={14} className="text-[#e10600]" />
            <span>Paddock Standings</span>
          </Link>

          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center space-x-3 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold tracking-widest uppercase"
          >
            <Settings size={14} className="text-white/60" />
            <span>Pilot Settings</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 py-3 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-[10px] font-bold tracking-widest uppercase group"
          >
            <LogOut size={14} className="group-hover:text-red-500 transition-colors" />
            <span className="group-hover:text-red-500 transition-colors">Terminate Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-w-[320px]">
      <h3 className="text-xl font-black font-syne tracking-tighter italic mb-6">
        {isLogin ? 'AUTH_SYSTEM' : 'REG_SYSTEM'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1.5">Email Terminal</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="OPERATOR@SYSTEM.COM"
            className="w-full bg-white/5 border border-white/10 py-3 px-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/5"
            required
          />
        </div>
        <div>
          <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-1.5">Passcode</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 py-3 px-4 text-[10px] font-bold tracking-widest text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/5"
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-white text-black font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 mt-6 flex items-center justify-center min-h-[44px]"
        >
          {loading ? <InlineLoader label="PROCESSING" size={12} /> : (isLogin ? 'AUTHENTICATE' : 'REGISTER')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-[8px] font-bold tracking-[0.3em] text-white/20 hover:text-white uppercase transition-colors"
        >
          {isLogin ? "No account? Create New Identity" : "Already registered? Return to Auth"}
        </button>
      </div>
    </div>
  );
};

export default AuthDropdown;
