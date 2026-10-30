import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AlertCircle, Shield } from 'lucide-react';

export default function SOSButton({ onActiveIncidentClick }) {
  const { initiateSOS, activeIncident, incidentLoading } = useEmergency();

  if (activeIncident) {
    return (
      <div className="flex flex-col items-center text-center p-6 bg-coral-950/40 border-2 border-coral-500 rounded-3xl shadow-2xl shadow-coral-600/30">
        <div className="w-20 h-20 rounded-full bg-coral-600/30 border-2 border-coral-500 flex items-center justify-center mb-4 animate-pulse">
          <AlertCircle className="w-10 h-10 text-coral-400" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-coral-500 text-white mb-2">
          EMERGENCY INCIDENT ACTIVE
        </span>
        <h3 className="text-xl font-bold text-white">Alerts Dispatched</h3>
        <p className="text-xs text-slate-300 mt-1 max-w-xs">
          Your live GPS coordinates are being transmitted to your safety network.
        </p>
        <button
          onClick={onActiveIncidentClick}
          className="mt-4 px-6 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-600/40 transition-all hover:scale-105"
        >
          View Incident Control Room & Link
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Effects */}
        <div className="absolute w-56 h-56 rounded-full bg-coral-500/15 animate-ping pointer-events-none"></div>
        <div className="absolute w-44 h-44 rounded-full bg-coral-600/20 animate-pulse pointer-events-none"></div>

        {/* SOS Button */}
        <button
          onClick={initiateSOS}
          disabled={incidentLoading}
          className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-coral-500 via-coral-600 to-coral-800 text-white shadow-2xl shadow-coral-600/50 flex flex-col items-center justify-center group active:scale-95 transition-transform border-4 border-white/20 focus:outline-none focus:ring-4 focus:ring-coral-400"
          aria-label="Activate Emergency SOS Assistance"
        >
          <Shield className="w-8 h-8 text-white/90 mb-1 group-hover:scale-110 transition-transform stroke-[2.5]" />
          <span className="text-3xl font-black tracking-wider drop-shadow-md">SOS</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-coral-100/90 mt-0.5">
            EMERGENCY
          </span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs font-semibold text-slate-300">Tap to start 5-second countdown alert</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Shares live location with your trusted contacts</p>
      </div>
    </div>
  );
}
