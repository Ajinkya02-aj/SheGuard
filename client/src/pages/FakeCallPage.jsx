import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  PhoneForwarded,
  Clock,
  User,
  Volume2,
  ShieldAlert,
  Play,
  Sparkles,
} from 'lucide-react';

export default function FakeCallPage() {
  const { triggerFakeCall } = useEmergency();
  const [callerName, setCallerName] = useState('Mom');
  const [delay, setDelay] = useState(0);
  const [pendingLaunch, setPendingLaunch] = useState(false);

  const presets = ['Mom', 'Dad', 'Inspector Sharma', 'Office Boss', 'Pooja (Sister)'];

  const handleLaunch = () => {
    setPendingLaunch(true);
    triggerFakeCall(callerName, delay);
    if (delay > 0) {
      setTimeout(() => {
        setPendingLaunch(false);
      }, delay * 1000);
    } else {
      setPendingLaunch(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-1">
        <div className="flex items-center gap-2">
          <PhoneForwarded className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white">Fake Call Escape Simulator</h1>
        </div>
        <p className="text-xs text-slate-400">
          Simulate a realistic incoming phone call to gracefully excuse yourself from unsafe or awkward situations.
        </p>
      </div>

      {pendingLaunch && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-pulse">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Simulated call scheduled! Keep this app visible on your phone screen...</span>
        </div>
      )}

      {/* Configuration Card */}
      <div className="bg-navy-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        {/* Caller Name Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Choose or Type Caller Name</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCallerName(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  callerName === name
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-navy-950 text-slate-300 border-white/10 hover:bg-navy-800'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            placeholder="Custom Caller Name..."
            className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Delay Timer Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Call Delay (When to Ring)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Right Now', val: 0 },
              { label: 'In 10 Seconds', val: 10 },
              { label: 'In 30 Seconds', val: 30 },
              { label: 'In 1 Minute', val: 60 },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setDelay(item.val)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  delay === item.val
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-navy-950 text-slate-300 border-white/10 hover:bg-navy-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Safety Escape Tool Disclosure</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            This tool produces audio ringtones and displays a simulated call interface in your browser. It does not initiate actual cellular phone calls or contact third parties.
          </p>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={pendingLaunch}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>
            {pendingLaunch
              ? `Incoming in ${delay}s...`
              : delay === 0
              ? 'Trigger Simulated Call Now'
              : `Trigger Call in ${delay}s`}
          </span>
        </button>
      </div>
    </div>
  );
}
