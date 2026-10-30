import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AlertOctagon, XCircle, ShieldAlert } from 'lucide-react';

export default function CountdownOverlay() {
  const { isCountdownActive, countdownSeconds, cancelCountdown } = useEmergency();

  if (!isCountdownActive) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-xl animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="countdown-title"
      aria-describedby="countdown-desc"
    >
      <div className="max-w-md w-full bg-gradient-to-b from-navy-900 to-navy-950 border-2 border-coral-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-coral-600/30 relative overflow-hidden">
        {/* Animated background rings */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full bg-coral-500/10 animate-ping"></div>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-coral-500/20 text-coral-400 mx-auto flex items-center justify-center mb-4 border border-coral-500/30">
          <AlertOctagon className="w-9 h-9 animate-bounce" />
        </div>

        <h2 id="countdown-title" className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
          Triggering Emergency SOS
        </h2>

        <p id="countdown-desc" className="text-sm text-slate-300 mt-2 leading-relaxed">
          Alerting trusted contacts & capturing live GPS coordinates in:
        </p>

        {/* Huge Countdown Display */}
        <div className="my-6">
          <div className="w-28 h-28 rounded-full border-4 border-coral-500 bg-coral-600/20 mx-auto flex items-center justify-center shadow-inner">
            <span className="text-6xl font-black text-white tracking-tight animate-pulse">
              {countdownSeconds}
            </span>
          </div>
        </div>

        {/* Cancellation Button */}
        <button
          onClick={cancelCountdown}
          className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base flex items-center justify-center gap-3 border border-white/20 shadow-lg active:scale-98 transition-all"
          autoFocus
        >
          <XCircle className="w-6 h-6 text-coral-400" />
          <span>CANCEL SOS (False Alarm)</span>
        </button>

        <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Tap cancel immediately if activated accidentally.</span>
        </p>
      </div>
    </div>
  );
}
