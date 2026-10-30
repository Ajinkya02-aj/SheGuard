import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/map/LeafletMap';
import { locationApi } from '../api/client';
import {
  Shield,
  MapPin,
  Clock,
  Battery,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export default function PublicTrack({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  useEffect(() => {
    fetchTrackingData();
    // Auto-refresh location breadcrumbs every 15 seconds
    const interval = setInterval(() => {
      fetchTrackingData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchTrackingData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await locationApi.getPublicTracking(token);
      setData(res);
      setIsExpired(false);
      setLastRefreshed(Date.now());
    } catch (err) {
      if (err.status === 410 || err.data?.expired) {
        setIsExpired(true);
        setError(err.data?.message || 'This live tracking session has expired or was revoked by the user.');
      } else {
        setError(err.message || 'Unable to access tracking session.');
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-coral-500/20 text-coral-400 flex items-center justify-center border border-coral-500/30 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white">Connecting to SHEGUARD Secure Tracking Channel...</p>
      </div>
    );
  }

  if (isExpired || error) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Tracking Session Ended</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {error || 'This live location session has reached its expiry limit or was terminated by the user.'}
          </p>
          <div className="p-3 bg-navy-950 rounded-xl text-[11px] text-slate-400">
            SHEGUARD automatically revokes location access after emergency resolution to protect personal privacy.
          </div>
          <a
            href="tel:112"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 National Helpline</span>
          </a>
        </div>
      </div>
    );
  }

  const { user, session, latestCoordinate, incident } = data;
  const isEmergency = incident?.status === 'active';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-navy-900/90 border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-coral-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wider">SHEGUARD SECURE TRACKING</span>
              <p className="text-[10px] text-slate-400">Authorized Contact Emergency Monitor</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] text-emerald-300 font-bold hidden sm:inline">LIVE SIGNAL</span>
            <button
              onClick={() => fetchTrackingData(false)}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300"
              title="Refresh GPS Signal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tracking Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Emergency Alert Banner if Active SOS */}
        {isEmergency ? (
          <div className="p-5 rounded-3xl bg-coral-600/20 border-2 border-coral-500 text-coral-100 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 font-black text-coral-400 text-base">
              <AlertTriangle className="w-5 h-5 text-coral-400" />
              <span>CRITICAL: EMERGENCY SOS ACTIVATED BY {user.name.toUpperCase()}</span>
            </div>
            <p className="text-xs text-white leading-relaxed font-medium">
              "{user.emergencyMessage || 'I need urgent assistance! This is an automated SHEGUARD alert.'}"
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Active Travel Sharing Session • {session.label}</span>
          </div>
        )}

        {/* User Profile Card */}
        <div className="bg-navy-900 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Last updated at {new Date(lastRefreshed).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {incident?.batteryLevel !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span>Battery: {incident?.batteryLevel}%</span>
                </div>
              )}
              {user.bloodGroup && user.bloodGroup !== 'Unknown' && (
                <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 font-bold text-coral-300">
                  Blood: {user.bloodGroup}
                </div>
              )}
            </div>
          </div>

          {/* Map View */}
          {latestCoordinate ? (
            <div className="space-y-3">
              <LeafletMap
                center={[latestCoordinate.latitude, latestCoordinate.longitude]}
                userLocation={{
                  lat: latestCoordinate.latitude,
                  lng: latestCoordinate.longitude,
                  accuracy: latestCoordinate.accuracy,
                }}
                className="h-80 sm:h-96 w-full rounded-2xl"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-navy-950 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-coral-400" />
                  <span>
                    Lat: {latestCoordinate.latitude.toFixed(5)}, Lng: {latestCoordinate.longitude.toFixed(5)} (~
                    {latestCoordinate.accuracy}m accuracy)
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${latestCoordinate.latitude},${latestCoordinate.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-sky-400 hover:underline"
                >
                  <span>Open Directions in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-navy-950 rounded-2xl text-xs text-slate-400">
              Waiting for initial GPS coordinates from user device...
            </div>
          )}

          {/* Emergency Calling Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="tel:112"
              className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112 National Emergency</span>
            </a>

            <a
              href={`tel:${user.primaryEmergencyNumber || '112'}`}
              className="py-3 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 text-center"
            >
              <PhoneCall className="w-4 h-4 text-coral-400" />
              <span>Call Primary Helpline ({user.primaryEmergencyNumber || '112'})</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-white/10 py-4 px-4 text-center text-[11px] text-slate-500">
        SHEGUARD Live Location Sharing • Encrypted & Access-Controlled
      </footer>
    </div>
  );
}
