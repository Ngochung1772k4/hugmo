import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, PlusCircle, User as UserIcon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isDemo, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-brand-700 bg-clip-text text-transparent">
                Hugmo
              </span>
            </div>
          </div>
        </Link>

        {/* Right navigation actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Status indicator */}
            {isDemo ? (
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Mode (Local)
              </span>
            ) : null}

            {/* Create Set Quick Action */}
            <Link
              to="/study-sets/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow transition-all duration-150"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Set</span>
            </Link>

            {/* User Profile display */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="font-medium truncate max-w-[140px]">
                {user.user_metadata?.display_name || user.email?.split('@')[0]}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
