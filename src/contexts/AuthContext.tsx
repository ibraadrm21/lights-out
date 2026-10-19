import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { PilotProfile } from '../types/auth';
import { useStore } from '../store/useStore';

interface AuthContextType {
  user: User | null;
  profile: PilotProfile | null;
  session: Session | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<PilotProfile, 'display_name' | 'avatar_url' | 'favorite_team'>>) => Promise<{ error: Error | null }>;
  earnCoins: (amount: number, reason?: string) => Promise<{ success: boolean; balance?: number }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PilotProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setCurrentUser, addCoins } = useStore();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile not found yet or error:', error.message);
        // Fallback profile if row trigger is pending
        return null;
      }
      return data as PilotProfile;
    } catch (err) {
      console.error('Error fetching pilot profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const prof = await fetchProfile(user.id);
    if (prof) {
      setProfile(prof);
      // Synchronize Zustand coins with database balance
      if (typeof prof.pitcoins === 'number') {
        useStore.setState({ coins: prof.pitcoins });
      }
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase getSession error:', error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setCurrentUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            const prof = await fetchProfile(initialSession.user.id);
            if (mounted && prof) {
              setProfile(prof);
              if (typeof prof.pitcoins === 'number') {
                useStore.setState({ coins: prof.pitcoins });
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, currentSession: Session | null) => {
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setCurrentUser(currentUser);

      if (currentUser) {
        const prof = await fetchProfile(currentUser.id);
        if (mounted) {
          setProfile(prof);
          if (prof && typeof prof.pitcoins === 'number') {
            useStore.setState({ coins: prof.pitcoins });
          }
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser, fetchProfile]);

  const updateProfile = async (updates: Partial<Pick<PilotProfile, 'display_name' | 'avatar_url' | 'favorite_team'>>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const earnCoins = async (amount: number, reason: string = 'Game Reward') => {
    // Always update local Zustand store for instantaneous responsive UI
    addCoins(amount);

    // If authenticated, persist to PostgreSQL via the secure RPC function
    if (user) {
      try {
        const { data: newBalance, error } = await supabase.rpc('transact_pitcoins', {
          amount,
          reason,
        });

        if (!error && typeof newBalance === 'number') {
          setProfile((prev) => (prev ? { ...prev, pitcoins: newBalance } : prev));
          useStore.setState({ coins: newBalance });
          return { success: true, balance: newBalance };
        }
      } catch (e) {
        console.warn('RPC transact_pitcoins not available yet or offline mode:', e);
      }
    }
    return { success: true };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        refreshProfile,
        updateProfile,
        earnCoins,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
