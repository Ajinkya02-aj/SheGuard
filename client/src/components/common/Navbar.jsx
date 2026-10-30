import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import DemoBadge from './DemoBadge';
import { Shield, AlertTriangle, PhoneCall, User, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ onNavigate, currentTab }) {
  const { user, isAuthenticated, logout, loginDemoAccount } = useAuth();
  const { activeIncident } = useEmergency();

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 group text-left focus:outline-none focus:ring-2 focus:ring-coral-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-600 to-coral-400 flex items-center justify-center shadow-lg shadow-coral-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">SHEGUARD</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-coral-500/20 text-coral-400 border border-coral-500/30">
                INDIA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Women's Safety & Emergency Assistance</p>
          </div>
        </button>

        {/* Center: Active SOS Alert Pill */}
        {activeIncident && (
          <button
            onClick={() => onNavigate('sos-active')}
            className="animate-pulse bg-coral-600/90 hover:bg-coral-500 text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg shadow-coral-600/40 border border-white/20 transition-all"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>SOS ACTIVE</span>
          </button>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:block">
                <DemoBadge />
              </div>

              {/* Direct Tap-to-Call 112 Speed dial shortcut */}
              <a
                href="tel:112"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-coral-300 border border-coral-500/40 text-xs font-bold transition-colors"
                title="Direct call to National Emergency 112"
              >
                <PhoneCall className="w-3.5 h-3.5 text-coral-400" />
                <span>Call 112</span>
              </a>

              {/* Profile button */}
              <button
                onClick={() => onNavigate('profile')}
                className={`p-2 rounded-lg border transition-colors ${
                  currentTab === 'profile'
                    ? 'bg-navy-800 text-coral-400 border-coral-500/50'
                    : 'bg-navy-800/60 text-slate-300 border-white/10 hover:bg-navy-800 hover:text-white'
                }`}
                title="Account Settings"
                aria-label="Profile and settings"
              >
                <User className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loginDemoAccount()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Demo</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 text-xs font-medium transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3 py-1.5 rounded-lg bg-coral-600 hover:bg-coral-500 text-white text-xs font-semibold shadow-md shadow-coral-600/30 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
