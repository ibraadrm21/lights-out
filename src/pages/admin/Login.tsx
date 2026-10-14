import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successStage, setSuccessStage] = useState<'idle' | 'authenticating' | 'completed'>('idle');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessStage('authenticating');
    
    // Slight pause to make the "authenticating..." state feel intentional
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      setSuccessStage('idle');
      setError(error.message.toUpperCase());
    } else if (data.user) {
      // Check if user is an admin in profiles table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabaseAdmin.auth.signOut();
        setSuccessStage('idle');
        setError('ACCESS DENIED: NOT AUTHORIZED AS ADMINISTRATOR');
      } else {
        setSuccessStage('completed');
        // Let user see the green tick and completion text before redirecting
        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-12 border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <h2 className="text-3xl font-black font-syne mb-8 text-center tracking-tighter">ACCESS SYSTEM</h2>
        
        <AnimatePresence mode="wait">
          {successStage !== 'idle' ? (
            <motion.div
              key="success-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              {successStage === 'authenticating' && (
                <motion.div
                  key="authenticating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full"
                  />
                  <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase animate-pulse">
                    authenticating...
                  </span>
                </motion.div>
              )}

              {successStage === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: [1, 0.4, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "easeInOut"
                    }}
                    className="w-12 h-12 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                  >
                    <Check size={20} strokeWidth={3} />
                  </motion.div>
                  <span className="text-[10px] font-mono tracking-[0.4em] text-green-400 uppercase font-bold text-center">
                    authentication completed
                  </span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-[10px] font-bold tracking-widest text-center">{error}</p>}
              
              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
              >
                Authenticate
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
