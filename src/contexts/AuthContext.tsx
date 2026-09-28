import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-user-1234-5678-90ab-cdef12345678',
  app_metadata: {},
  user_metadata: { display_name: 'Demo Student' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@quizlet.local',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    return localStorage.getItem('quizlet_demo_mode') === 'true';
  });

  useEffect(() => {
    if (isDemo) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Not configured and not demo yet
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemo]);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim();

    if (isDemo || !isSupabaseConfigured) {
      // Demo login
      setIsDemo(true);
      localStorage.setItem('quizlet_demo_mode', 'true');
      setUser({ ...DEMO_USER, email: normalizedEmail });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const normalizedEmail = email.trim();

    if (isDemo || !isSupabaseConfigured) {
      // Demo signup
      setIsDemo(true);
      localStorage.setItem('quizlet_demo_mode', 'true');
      setUser({
        ...DEMO_USER,
        email: normalizedEmail,
        user_metadata: { display_name: displayName || normalizedEmail.split('@')[0] },
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          display_name: displayName || normalizedEmail.split('@')[0],
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (isDemo) {
      setIsDemo(false);
      localStorage.removeItem('quizlet_demo_mode');
      setUser(null);
      return;
    }

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const enableDemoMode = () => {
    setIsDemo(true);
    localStorage.setItem('quizlet_demo_mode', 'true');
    setUser(DEMO_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemo,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
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
