import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function DemoBadge({ className = '' }) {
  const { user, toggleDemoMode } = useAuth();

  if (!user) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
        user.demoMode
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
      } ${className}`}
      role="status"
      aria-label={user.demoMode ? 'Demo Mode Active' : 'Live Production Mode'}
    >
      {user.demoMode ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>DEMO MODE</span>
          <button
            onClick={toggleDemoMode}
            className="ml-1 text-[10px] underline hover:text-white transition-colors"
            title="Switch to Live Mode"
          >
            (Switch to Live)
          </button>
        </>
      ) : (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>LIVE MODE</span>
          <button
            onClick={toggleDemoMode}
            className="ml-1 text-[10px] underline hover:text-white transition-colors"
            title="Switch to Demo Mode"
          >
            (Switch to Demo)
          </button>
        </>
      )}
    </div>
  );
}
