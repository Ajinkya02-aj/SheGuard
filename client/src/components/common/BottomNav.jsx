import React from 'react';
import { Home, Users, MapPin, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export default function BottomNav({ currentTab, onNavigate }) {
  const { initiateSOS, activeIncident } = useEmergency();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'sos-action', label: 'SOS', isPrimaryAction: true },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'timer', label: 'Timer', icon: Clock },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isPrimaryAction) {
            return (
              <div key="sos-button" className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => {
                    if (activeIncident) {
                      onNavigate('sos-active');
                    } else {
                      initiateSOS();
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xl transition-transform active:scale-95 ${
                    activeIncident
                      ? 'bg-amber-600 animate-bounce shadow-amber-600/50'
                      : 'bg-gradient-to-tr from-coral-700 via-coral-600 to-coral-400 shadow-coral-600/50 hover:scale-105'
                  }`}
                  aria-label={activeIncident ? 'View Active SOS Incident' : 'Trigger Emergency SOS'}
                >
                  <span className="tracking-tighter">SOS</span>
                </button>
                <span className="text-[10px] font-bold text-coral-400 mt-1">EMERGENCY</span>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-coral-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
