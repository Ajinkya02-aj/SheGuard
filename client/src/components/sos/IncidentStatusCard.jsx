import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  AlertTriangle,
  PhoneCall,
  Share2,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  Battery,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export default function IncidentStatusCard({ incident, onResolved }) {
  const { cancelActiveIncident, resolveActiveIncident } = useEmergency();
  const [copySuccess, setCopySuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!incident) return null;

  const trackingUrl = `${window.location.origin}/track/${incident.shareToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await resolveActiveIncident('User confirmed safety via incident control panel.');
      if (onResolved) onResolved();
    } catch (err) {
      alert('Failed to resolve incident: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      await cancelActiveIncident(cancelReason || 'False alarm / drill');
      setShowCancelModal(false);
      if (onResolved) onResolved();
    } catch (err) {
      alert('Failed to cancel incident: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-navy-900 border-2 border-coral-500 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-coral-600/20 space-y-6">
      {/* Top Incident Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-600/20 text-coral-400 border border-coral-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base sm:text-lg">SOS Incident Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-coral-500 text-white animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Triggered at {new Date(incident.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {incident.batteryLevel !== null && (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-navy-800/80 px-3 py-1.5 rounded-xl border border-white/10">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>Battery: {incident.batteryLevel}%</span>
          </div>
        )}
      </div>

      {/* Captured Location Info */}
      <div className="bg-navy-950/70 rounded-2xl p-4 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <MapPin className="w-4 h-4 text-coral-400" />
          <span>Last Captured Location</span>
        </div>
        <p className="text-sm font-medium text-white">{incident.location?.address || 'GPS Coordinates captured'}</p>
        {incident.location?.latitude && (
          <p className="text-xs text-slate-400">
            Lat: {incident.location.latitude.toFixed(5)}, Lng: {incident.location.longitude.toFixed(5)} (Accuracy: ~
            {incident.location.accuracy || 10}m)
          </p>
        )}
      </div>

      {/* Live Tracking Link Box */}
      {incident.shareToken && (
        <div className="bg-coral-950/30 border border-coral-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-coral-300 uppercase tracking-wider">
              Emergency Tracking Link (Authorized Contacts)
            </span>
            <span className="text-[10px] text-slate-400">Expires in 2 hrs</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={trackingUrl}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 select-all font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Live GPS URL"
            >
              {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <a
              href={`/track/${incident.shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 transition-colors shrink-0"
              title="Open public tracking view"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Recipient Alert Statuses */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Trusted Contact Delivery Status
        </h4>
        <div className="space-y-2">
          {incident.alertRecipients && incident.alertRecipients.length > 0 ? (
            incident.alertRecipients.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-white/5 text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{rec.name}</p>
                  <p className="text-slate-400 text-[11px]">{rec.phone}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {rec.status === 'sent' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sent</span>
                    </span>
                  )}
                  {rec.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Pending</span>
                    </span>
                  )}
                  {rec.status === 'failed' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No trusted contacts were configured for alert dispatch.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href="tel:112"
          className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all text-center"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 112 National Police</span>
        </a>

        <button
          onClick={handleResolve}
          disabled={actionLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>I Am Safe (Resolve Alert)</span>
        </button>

        <button
          onClick={() => setShowCancelModal(true)}
          disabled={actionLoading}
          className="sm:col-span-2 py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <XCircle className="w-4 h-4 text-coral-400" />
          <span>Cancel as False Alarm / Drill</span>
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Emergency Incident?</h3>
            <p className="text-xs text-slate-300">
              This will stop live tracking and mark the alert as cancelled. Are you sure?
            </p>
            <input
              type="text"
              placeholder="Reason (e.g. Accidental click, drill test)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
