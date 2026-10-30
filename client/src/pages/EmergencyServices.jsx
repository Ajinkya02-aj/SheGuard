import React, { useState, useEffect } from 'react';
import { emergencyApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  PhoneCall,
  Shield,
  AlertTriangle,
  HeartPulse,
  Flame,
  Globe,
  MessageSquare,
  ShieldAlert,
  Info,
  CheckCircle,
} from 'lucide-react';

export default function EmergencyServices() {
  const { user, updateProfile } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [primaryNumber, setPrimaryNumber] = useState(user?.primaryEmergencyNumber || '112');
  const [savingPrimary, setSavingPrimary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await emergencyApi.getServices();
      setServices(res.services || []);
    } catch (e) {
      console.warn('Could not load services:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrimary = async (e) => {
    e.preventDefault();
    setSavingPrimary(true);
    try {
      await updateProfile({ primaryEmergencyNumber: primaryNumber });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update primary emergency number: ' + err.message);
    } finally {
      setSavingPrimary(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-1">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-coral-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Services & Helplines</h1>
        </div>
        <p className="text-xs text-slate-400">
          Official 24/7 emergency response contacts across India. Tap any button to launch your device dialer.
        </p>
      </div>

      {/* Hero: National 112 Universal Helpline */}
      <div className="bg-gradient-to-r from-red-950 via-navy-900 to-navy-950 p-6 sm:p-8 rounded-3xl border-2 border-red-500 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white">
              <ShieldAlert className="w-3.5 h-3.5" />
              Primary National Response Number
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Dial 112 <span className="text-lg font-bold text-slate-400 block sm:inline">(All-in-One ERSS)</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              India's unified emergency number integrating Police, Fire, Ambulance, and Disaster assistance. Works toll-free across all telecom networks and operating systems.
            </p>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-red-600/40 hover:scale-105 transition-all text-center shrink-0"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call 112 Now</span>
          </a>
        </div>
      </div>

      {/* Configurable Primary Emergency Number */}
      <div className="bg-navy-900 p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Configurable Primary Emergency Number</h3>
            <p className="text-xs text-slate-400">
              Customize the number dialed by the top navbar shortcut (defaults to 112).
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSavePrimary} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={primaryNumber}
            onChange={(e) => setPrimaryNumber(e.target.value)}
            placeholder="112 or local police control"
            className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
          />
          <button
            type="submit"
            disabled={savingPrimary}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 text-xs font-bold shrink-0 transition-colors"
          >
            {savingPrimary ? 'Saving...' : 'Update'}
          </button>
        </form>
      </div>

      {/* Full Services Directory List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official Indian Helplines Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-3xl bg-navy-900/70 border border-white/5 space-y-3 flex flex-col justify-between hover:border-white/15 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">
                    {srv.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-950 text-slate-400 border border-white/10">
                    {srv.availability}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <h4 className="text-xl font-black text-white">{srv.shortCode}</h4>
                  <p className="text-xs font-bold text-slate-300">{srv.name}</p>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-2">
                <a
                  href={srv.speedDial}
                  className="w-full py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-coral-600 text-slate-200 hover:text-white border border-white/10 hover:border-coral-500 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-coral-400 group-hover:text-white" />
                  <span>Tap to Dial {srv.shortCode}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice & Legal Disclaimer */}
      <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Operational Disclosure</span>
        </p>
        <p className="text-[11px] leading-relaxed">
          SHEGUARD provides direct tap-to-call shortcuts to launch your device's native telephone dialer. The application does not automatically place calls without your explicit user action, and cannot guarantee telecom carrier coverage or emergency service response times.
        </p>
      </div>
    </div>
  );
}
