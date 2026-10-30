import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/map/LeafletMap';
import { locationApi } from '../api/client';
import { getCurrentCoordinates } from '../utils/geolocation';
import {
  MapPin,
  Clock,
  Share2,
  Copy,
  CheckCircle2,
  StopCircle,
  Play,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function LiveTracking() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(30);
  const [label, setLabel] = useState('Travel Ride Sharing');
  const [userLocation, setUserLocation] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    loadSession();
    fetchLocation();
  }, []);

  // Update countdown timer
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.expiresAt) {
      interval = setInterval(() => {
        const remainingMs = new Date(activeSession.expiresAt) - new Date();
        if (remainingMs <= 0) {
          setTimeRemaining('Expired');
          setActiveSession(null);
        } else {
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          setTimeRemaining(`${mins}m ${secs}s`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const res = await locationApi.getActiveSession();
      setActiveSession(res.activeSession || null);
    } catch (err) {
      console.warn('Error loading active location session:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocation = async () => {
    try {
      const coords = await getCurrentCoordinates();
      setUserLocation({
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        address: coords.address,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleStartSharing = async () => {
    try {
      const coords = await getCurrentCoordinates();
      const res = await locationApi.startSession({
        durationMinutes: duration,
        label,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });
      setActiveSession(res.session);
    } catch (err) {
      alert('Failed to start live location sharing: ' + err.message);
    }
  };

  const handleStopSharing = async () => {
    try {
      await locationApi.stopSession({ token: activeSession?.token });
      setActiveSession(null);
    } catch (err) {
      alert('Failed to stop session: ' + err.message);
    }
  };

  const handleCopy = async () => {
    if (!activeSession) return;
    const url = `${window.location.origin}/track/${activeSession.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-coral-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Live Location Sharing</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Create a time-limited, access-controlled tracking link for authorized trusted contacts.
          </p>
        </div>

        {activeSession && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SHARING ACTIVE ({timeRemaining})</span>
          </div>
        )}
      </div>

      {activeSession ? (
        /* Active Sharing Session Panel */
        <div className="bg-navy-900 border-2 border-emerald-500/40 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Active Sharing Session
              </span>
              <h2 className="text-xl font-black text-white">{activeSession.label}</h2>
              <p className="text-xs text-slate-400">
                Created at {new Date(activeSession.createdAt).toLocaleTimeString()} • Auto-expires in {timeRemaining}
              </p>
            </div>

            <button
              onClick={handleStopSharing}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop Sharing Now</span>
            </button>
          </div>

          {/* Secure Link Box */}
          <div className="bg-navy-950 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Secure Tracking Link (Random Unguessable Token)</span>
              <span className="text-[10px] text-slate-500">Access limited to link recipients</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/track/${activeSession.token}`}
                className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
              >
                {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`/track/${activeSession.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Map Preview */}
          {userLocation && (
            <LeafletMap
              center={[userLocation.lat, userLocation.lng]}
              userLocation={userLocation}
              className="h-64 w-full rounded-2xl"
            />
          )}

          <div className="p-3 bg-navy-950 rounded-xl text-xs text-slate-400 flex items-center gap-2 border border-white/5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Live coordinates update when the browser remains active. Stopping the session immediately invalidates the link.
            </span>
          </div>
        </div>
      ) : (
        /* Create New Live Sharing Session Form */
        <div className="bg-navy-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">Start a Temporary Live Sharing Session</h2>
            <p className="text-xs text-slate-400">
              Ideal for cab rides, night travel, or unknown routes. The link automatically expires.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Trip Description / Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Taking Uber from Sector 18 to Home"
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-coral-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Session Expiration Duration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      duration === mins
                        ? 'bg-coral-600 text-white border-coral-500 shadow-md shadow-coral-600/30'
                        : 'bg-navy-950 text-slate-300 border-white/10 hover:bg-navy-800'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60} Hour${mins > 60 ? 's' : ''}` : `${mins} Minutes`}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Disclosures */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Privacy & Security Guarantee</span>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
                <li>Your location is never made public or indexed by search engines.</li>
                <li>Only individuals with the unguessable 128-bit random token can view your tracking link.</li>
                <li>When the timer expires or you tap stop, the link is permanently invalidated.</li>
              </ul>
            </div>

            <button
              onClick={handleStartSharing}
              className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-sm shadow-xl shadow-coral-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Sharing Live Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
