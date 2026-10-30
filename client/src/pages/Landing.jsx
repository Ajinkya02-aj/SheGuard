import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  PhoneCall,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function Landing({ onNavigate }) {
  const { loginDemoAccount, isAuthenticated } = useAuth();

  const handleStartDemo = async () => {
    try {
      await loginDemoAccount();
      onNavigate('dashboard');
    } catch (err) {
      alert('Could not start demo: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/30 text-coral-300 text-xs font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-coral-400" />
            <span>Emergency Ready • Built for India</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Safety in Seconds with <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 via-coral-500 to-red-500">SHEGUARD</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A comprehensive, instant emergency response platform for women. One-tap SOS countdown, time-limited live location sharing, travel check-in timers, and verified helpline integrations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-coral-600 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white font-black text-sm shadow-xl shadow-coral-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Enter Safety Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartDemo}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-coral-600 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white font-black text-sm shadow-xl shadow-coral-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Explore Demo Mode (1-Click)</span>
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 rounded-2xl bg-navy-800/80 hover:bg-navy-800 text-slate-200 border border-white/10 font-bold text-sm transition-all"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* National Helplines Bar */}
        <div className="mt-16 p-4 rounded-2xl bg-navy-900/60 border border-white/10 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2 border-r border-white/5 last:border-none">
            <p className="text-xl sm:text-2xl font-black text-coral-400">112</p>
            <p className="text-[11px] text-slate-400 font-medium">National Emergency (All-in-One)</p>
          </div>
          <div className="p-2 border-r border-white/5 last:border-none">
            <p className="text-xl sm:text-2xl font-black text-white">1091</p>
            <p className="text-[11px] text-slate-400 font-medium">Women in Distress Helpline</p>
          </div>
          <div className="p-2 border-r border-white/5 last:border-none">
            <p className="text-xl sm:text-2xl font-black text-white">181</p>
            <p className="text-[11px] text-slate-400 font-medium">Domestic Abuse Support</p>
          </div>
          <div className="p-2">
            <p className="text-xl sm:text-2xl font-black text-sky-400">1930</p>
            <p className="text-[11px] text-slate-400 font-medium">Cyber Crime Reporting</p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Engineered for Critical Situations</h2>
          <p className="text-sm text-slate-400 mt-2">Zero ambiguity, high-contrast actions, and verified Indian emergency networks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-navy-900/50 border border-white/10 space-y-3 hover:border-coral-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-400 flex items-center justify-center border border-coral-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">5-Second Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Large touch trigger with a 5-second countdown to prevent accidental alarms. Automatically captures GPS coordinates and dispatches alert records.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-navy-900/50 border border-white/10 space-y-3 hover:border-coral-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Time-Limited Live Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share your route using secure, unguessable token links. Authorized contacts view live battery & GPS pins without creating an account. Automatically expires after set duration.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-navy-900/50 border border-white/10 space-y-3 hover:border-coral-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Safety Arrival Timers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heading home in an auto or cab? Set a 20-minute safety check-in timer. If you miss your safe arrival check-in, alert notifications escalate to your designated contacts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <p>SHEGUARD • Indian Women's Safety & Emergency Assistance Platform</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Always dial 112 directly if in immediate physical danger. Web-based features depend on carrier connectivity and device permissions.
        </p>
      </footer>
    </div>
  );
}
