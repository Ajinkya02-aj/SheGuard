import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid, User, ShieldAlert } from 'lucide-react';
import { startSimulatedRingtone, stopSimulatedRingtone } from '../../utils/audio';

export default function FakeCallModal({ callerName = 'Mom', onClose }) {
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'active'
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    startSimulatedRingtone();
    return () => {
      stopSimulatedRingtone();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (callState === 'active') {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleAnswer = () => {
    stopSimulatedRingtone();
    setCallState('active');
  };

  const handleDecline = () => {
    stopSimulatedRingtone();
    if (onClose) onClose();
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white animate-fade-in p-4"
      role="dialog"
      aria-label="Simulated Incoming Call"
    >
      <div className="w-full max-w-sm h-[650px] max-h-[90vh] bg-gradient-to-b from-slate-900 via-navy-950 to-black rounded-3xl border border-white/20 flex flex-col justify-between p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Safety Disclaimer Banner */}
        <div className="absolute top-3 left-0 right-0 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            <ShieldAlert className="w-3 h-3" />
            Simulated Call • Not a real phone call
          </span>
        </div>

        {/* Top Caller Info */}
        <div className="flex flex-col items-center mt-12 text-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center shadow-xl">
            <User className="w-12 h-12 text-slate-300" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{callerName}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {callState === 'incoming' ? 'Incoming Mobile Call...' : formatTimer(callSeconds)}
            </p>
          </div>
        </div>

        {/* Call Controls depending on state */}
        {callState === 'incoming' ? (
          <div className="flex items-center justify-around mb-8">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-all"
                aria-label="Decline Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs font-semibold text-slate-400">Decline</span>
            </div>

            {/* Answer */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAnswer}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce active:scale-95 transition-all"
                aria-label="Answer Call"
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="text-xs font-semibold text-slate-400">Accept</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8 mb-6">
            {/* Active In-Call Grid */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors ${
                  isMuted ? 'bg-white text-black border-white' : 'bg-slate-800/60 border-white/10 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
                <span className="text-[10px]">Mute</span>
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors ${
                  isSpeaker ? 'bg-white text-black border-white' : 'bg-slate-800/60 border-white/10 text-white'
                }`}
              >
                <Volume2 className="w-6 h-6 mb-1" />
                <span className="text-[10px]">Speaker</span>
              </button>

              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-white">
                <Grid className="w-6 h-6 mb-1" />
                <span className="text-[10px]">Keypad</span>
              </button>
            </div>

            {/* End Call Button */}
            <div className="flex justify-center">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-all"
                aria-label="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
