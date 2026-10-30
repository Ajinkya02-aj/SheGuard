import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import SOSButton from '../components/sos/SOSButton';
import IncidentStatusCard from '../components/sos/IncidentStatusCard';
import DemoBadge from '../components/common/DemoBadge';
import { contactsApi } from '../api/client';
import {
  PhoneCall,
  Clock,
  PhoneForwarded,
  MapPin,
  Users,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Plus,
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const {
    activeIncident,
    refreshEmergencyState,
    activeTimer,
    checkInTimer,
    triggerFakeCall,
  } = useEmergency();

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const res = await contactsApi.getAll();
      setContacts(res.contacts || []);
    } catch (err) {
      console.warn('Could not load contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  const emergencyRecipients = contacts.filter((c) => c.isEmergencyRecipient);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Top Welcome & Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Hi, {user?.name ? user.name.split(' ')[0] : 'Guardian'}
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Emergency network ready • {emergencyRecipients.length} trusted contacts active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DemoBadge />
        </div>
      </div>

      {/* Active SOS Control Room if SOS is Triggered */}
      {activeIncident ? (
        <IncidentStatusCard incident={activeIncident} onResolved={refreshEmergencyState} />
      ) : (
        /* SOS Trigger Section */
        <div className="bg-gradient-to-b from-navy-900 via-navy-900/90 to-navy-950 p-6 sm:p-8 rounded-3xl border border-coral-500/20 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-coral-400">
              One-Touch Emergency Assistance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Press for Emergency SOS</h2>
          </div>

          <SOSButton onActiveIncidentClick={() => onNavigate('sos-active')} />
        </div>
      )}

      {/* Active Safety Timer Card if running */}
      {activeTimer && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Active Safety Arrival Timer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {activeTimer.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{activeTimer.destination}</p>
              <p className="text-xs text-slate-400">
                Expected: {new Date(activeTimer.expectedArrivalTime).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => checkInTimer()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              I Have Arrived Safely
            </button>
            <button
              onClick={() => onNavigate('timer')}
              className="px-3 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-medium hover:text-white"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Quick Safety Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Fake Call */}
        <button
          onClick={() => triggerFakeCall('Mom', 0)}
          className="p-4 rounded-2xl bg-navy-900/70 hover:bg-navy-800/90 border border-white/10 flex flex-col items-center text-center space-y-2 group transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneForwarded className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Fake Call</h4>
            <p className="text-[10px] text-slate-400">Escape awkward situations</p>
          </div>
        </button>

        {/* Safety Arrival Timer */}
        <button
          onClick={() => onNavigate('timer')}
          className="p-4 rounded-2xl bg-navy-900/70 hover:bg-navy-800/90 border border-white/10 flex flex-col items-center text-center space-y-2 group transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Safety Timer</h4>
            <p className="text-[10px] text-slate-400">Track trip arrival</p>
          </div>
        </button>

        {/* Share Live Location */}
        <button
          onClick={() => onNavigate('tracking')}
          className="p-4 rounded-2xl bg-navy-900/70 hover:bg-navy-800/90 border border-white/10 flex flex-col items-center text-center space-y-2 group transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Live Tracking</h4>
            <p className="text-[10px] text-slate-400">Share temporary GPS link</p>
          </div>
        </button>

        {/* Direct Tap-to-Call 112 */}
        <a
          href="tel:112"
          className="p-4 rounded-2xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 flex flex-col items-center text-center space-y-2 group transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-red-600/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Dial 112</h4>
            <p className="text-[10px] text-coral-300">National Emergency</p>
          </div>
        </a>
      </div>

      {/* Trusted Safety Network Preview */}
      <div className="bg-navy-900/70 rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-coral-400" />
            <h3 className="text-sm font-bold text-white">Trusted Safety Network</h3>
          </div>
          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs font-semibold text-coral-400 hover:text-coral-300 flex items-center gap-1"
          >
            <span>Manage ({contacts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {contacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contacts.slice(0, 3).map((contact) => (
              <div
                key={contact._id}
                className="p-3 rounded-2xl bg-navy-950/70 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{contact.name}</p>
                  <p className="text-[11px] text-slate-400">{contact.relationship} • {contact.phone}</p>
                </div>
                {contact.isEmergencyRecipient ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Receives SOS alerts"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" title="Alerts disabled"></span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-navy-950/40 rounded-2xl border border-dashed border-white/10 space-y-2">
            <p className="text-xs text-slate-400">No emergency contacts added yet.</p>
            <button
              onClick={() => onNavigate('contacts')}
              className="px-4 py-1.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Contact</span>
            </button>
          </div>
        )}
      </div>

      {/* Verified Indian Helplines Carousel / Directory Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-950 p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Indian Helplines</h4>
          </div>
          <p className="text-xs text-slate-300">
            Emergency dialing shortcuts: <strong className="text-coral-400">112</strong> (National ERSS),{' '}
            <strong className="text-white">1091</strong> (Women in Distress), <strong className="text-white">181</strong> (Domestic Abuse),{' '}
            <strong className="text-white">1930</strong> (Cyber Fraud).
          </p>
        </div>

        <button
          onClick={() => onNavigate('emergency-services')}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>View All Helplines</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
