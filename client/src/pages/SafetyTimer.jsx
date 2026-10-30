import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { contactsApi } from '../api/client';
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Play,
  XCircle,
  Users,
  Bell,
  StopCircle,
} from 'lucide-react';

export default function SafetyTimer() {
  const {
    activeTimer,
    startTimer,
    checkInTimer,
    cancelTimer,
    escalateTimer,
    refreshEmergencyState,
  } = useEmergency();

  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(15);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [remainingTime, setRemainingTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await contactsApi.getAll();
      const list = res.contacts || [];
      setContacts(list);
      // Default to selecting all emergency contacts
      setSelectedContacts(list.filter((c) => c.isEmergencyRecipient).map((c) => c._id));
    } catch (e) {
      console.warn('Error loading contacts:', e);
    }
  };

  // Timer countdown updater
  useEffect(() => {
    let interval;
    if (activeTimer) {
      const updateClock = () => {
        const diff = new Date(activeTimer.expectedArrivalTime) - new Date();
        if (diff <= 0) {
          setRemainingTime('OVERDUE');
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setRemainingTime(`${mins}m ${secs.toString().padStart(2, '0')}s`);
        }
      };

      updateClock();
      interval = setInterval(updateClock, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert('Please provide a destination or trip description.');
      return;
    }

    setSubmitting(true);
    try {
      await startTimer(destination, duration, notes, selectedContacts);
      setDestination('');
      setNotes('');
    } catch (err) {
      alert('Failed to start safety timer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const isOverdue = remainingTime === 'OVERDUE' || activeTimer?.status === 'overdue';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-coral-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Safety Arrival Timer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Set an arrival deadline before traveling. Check in when safe; misses trigger automated contact alerts.
          </p>
        </div>

        {activeTimer && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
              isOverdue
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span>{isOverdue ? 'DEADLINE MISSED • OVERDUE' : `RUNNING (${remainingTime})`}</span>
          </div>
        )}
      </div>

      {activeTimer ? (
        /* Active Timer Dashboard */
        <div
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl space-y-6 ${
            isOverdue
              ? 'bg-red-950/40 border-red-500 shadow-red-600/30'
              : 'bg-navy-900 border-amber-500/40'
          }`}
        >
          <div className="text-center space-y-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isOverdue ? 'bg-red-600 text-white animate-bounce' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOverdue ? 'Trip Overdue - Check In Now' : 'Safety Timer Active'}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white">{activeTimer.destination}</h2>

            <p className="text-xs text-slate-300">
              Expected arrival:{' '}
              <strong className="text-white">
                {new Date(activeTimer.expectedArrivalTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </p>

            {/* Countdown Box */}
            <div className="my-6">
              <div
                className={`w-36 h-36 rounded-full border-4 mx-auto flex flex-col items-center justify-center shadow-inner ${
                  isOverdue
                    ? 'border-red-500 bg-red-600/20 text-red-300'
                    : 'border-amber-500 bg-amber-500/10 text-amber-300'
                }`}
              >
                <span className="text-3xl font-black tracking-tight">{remainingTime}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                  {isOverdue ? 'Time Missed' : 'Remaining'}
                </span>
              </div>
            </div>

            {activeTimer.notes && (
              <p className="text-xs text-slate-400 bg-navy-950/60 p-3 rounded-xl max-w-md mx-auto">
                Notes: {activeTimer.notes}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={() => checkInTimer()}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              <span>I Have Arrived Safely (Check In)</span>
            </button>

            {isOverdue && (
              <button
                onClick={() => escalateTimer()}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Escalate Alert to Contacts Immediately</span>
              </button>
            )}

            <button
              onClick={() => cancelTimer()}
              className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Trip Timer</span>
            </button>
          </div>
        </div>
      ) : (
        /* Create Safety Timer Form */
        <div className="bg-navy-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">Start a Travel or Meeting Check-In Timer</h2>
            <p className="text-xs text-slate-400">
              Ideal when boarding an auto, cab, or meeting someone unfamiliar.
            </p>
          </div>

          <form onSubmit={handleStartTimer} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Destination or Trip Purpose <span className="text-coral-400">*</span>
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Taking auto DL-1R-2910 from Metro to Home"
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-coral-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Trip Notes / Vehicle Details</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Driver name: Ramesh, White Dzire"
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-coral-500"
              />
            </div>

            {/* Duration presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Expected Trip Duration</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[5, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      duration === mins
                        ? 'bg-coral-600 text-white border-coral-500 shadow-md shadow-coral-600/30'
                        : 'bg-navy-950 text-slate-300 border-white/10 hover:bg-navy-800'
                    }`}
                  >
                    {mins} Mins
                  </button>
                ))}
              </div>
            </div>

            {/* Select Contacts */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Contacts to Escalate if Overdue</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contacts.map((c) => (
                    <label
                      key={c._id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        selectedContacts.includes(c._id)
                          ? 'bg-navy-800 border-coral-500/50 text-white'
                          : 'bg-navy-950 border-white/5 text-slate-400'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.relationship} • {c.phone}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(c._id)}
                        onChange={() => toggleContactSelection(c._id)}
                        className="w-4 h-4 rounded text-coral-600 focus:ring-coral-500 bg-navy-900 border-white/20"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Browser Disclaimer */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Device & Browser Limitations Disclaimer</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Browser background timers may slow down or pause if the tab is completely closed or the device loses internet connection. Do not rely exclusively on the browser timer as a substitute for 112 emergency calling.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-sm shadow-xl shadow-coral-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Safety Arrival Timer</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
