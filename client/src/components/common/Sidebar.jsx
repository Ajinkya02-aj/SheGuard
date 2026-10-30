import React from 'react';
import {
  Home,
  Users,
  MapPin,
  Clock,
  PhoneCall,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Settings,
  AlertTriangle,
  PhoneForwarded,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export default function Sidebar({ currentTab, onNavigate }) {
  const { activeIncident } = useEmergency();

  const links = [
    { id: 'dashboard', label: 'Emergency Dashboard', icon: Home },
    ...(activeIncident ? [{ id: 'sos-active', label: 'Active SOS Incident', icon: AlertTriangle, highlight: true }] : []),
    { id: 'contacts', label: 'Trusted Contacts', icon: Users },
    { id: 'map', label: 'Safety Map & Facilities', icon: MapPin },
    { id: 'tracking', label: 'Live Location Sharing', icon: MapPin },
    { id: 'timer', label: 'Safety Arrival Timer', icon: Clock },
    { id: 'fakecall', label: 'Fake Call Simulator', icon: PhoneForwarded },
    { id: 'emergency-services', label: 'Emergency Helplines (112)', icon: PhoneCall },
    { id: 'resources', label: 'Legal & Safety Resources', icon: BookOpen },
    { id: 'profile', label: 'Profile & Privacy Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-900/60 border-r border-white/10 p-4 space-y-6 shrink-0">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Navigation</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;

          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                link.highlight
                  ? 'bg-coral-600/20 text-coral-300 border border-coral-500/40 animate-pulse'
                  : isActive
                  ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive || link.highlight ? 'text-coral-400' : 'text-slate-400'}`} />
              <span className="truncate">{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Emergency Disclaimer Card */}
      <div className="mt-auto p-3.5 rounded-xl bg-navy-950/70 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>India Safety Coverage</span>
        </p>
        <p className="text-slate-400 leading-relaxed">
          National Emergency Helpline: <strong className="text-white">112</strong>. Single-dial support across all states.
        </p>
      </div>
    </aside>
  );
}
