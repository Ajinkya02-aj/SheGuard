import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import {
  User,
  Phone,
  Mail,
  Heart,
  Shield,
  MapPin,
  Bell,
  Trash2,
  LogOut,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function ProfileSettings({ onNavigate }) {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'Unknown',
    medicalNotes: user?.medicalNotes || '',
    emergencyMessage: user?.emergencyMessage || '',
    primaryEmergencyNumber: user?.primaryEmergencyNumber || '112',
    demoMode: user?.demoMode || false,
    notificationPreferences: user?.notificationPreferences || {
      sms: true,
      push: true,
      sound: true,
    },
  });

  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      } catch (e) {
        setPermissionStatus('unknown');
      }
    } else {
      setPermissionStatus('unsupported');
    }
  };

  const requestGpsAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => checkLocationPermission(),
        () => checkLocationPermission()
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateProfile(formData);
      setSuccessMsg('Profile and preferences updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount();
      logout();
      onNavigate('landing');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-coral-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Profile & Safety Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal medical profile, emergency alert messages, and device permissions.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('landing');
          }}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4 text-coral-400" />
          <span>Log Out</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Location Permission Status Card */}
      <div className="bg-navy-900 rounded-3xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
              permissionStatus === 'granted'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Browser Geolocation Permission</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {permissionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {permissionStatus === 'granted'
                ? 'GPS location is available for emergency SOS tracking.'
                : 'Permission not yet granted. Tap to grant browser location access.'}
            </p>
          </div>
        </div>

        {permissionStatus !== 'granted' && (
          <button
            onClick={requestGpsAccess}
            className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-xs shadow-md shadow-coral-600/30"
          >
            Grant Location Access
          </button>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-navy-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Personal Safety Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Registered Phone (+91)</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Primary Emergency Helpline</label>
            <input
              type="text"
              value={formData.primaryEmergencyNumber}
              onChange={(e) => setFormData({ ...formData, primaryEmergencyNumber: e.target.value })}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Medical Notes & Known Allergies</label>
          <textarea
            rows="2"
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            placeholder="e.g. Type 1 Diabetic, Inhaler in handbag"
            className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Custom Emergency SOS Message</label>
          <textarea
            rows="2"
            value={formData.emergencyMessage}
            onChange={(e) => setFormData({ ...formData, emergencyMessage: e.target.value })}
            className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
          ></textarea>
          <p className="text-[10px] text-slate-500">Live GPS tracking link is appended to this message automatically.</p>
        </div>

        {/* Demo Mode Toggle */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-300">Application Demo Mode</h4>
            <p className="text-[11px] text-slate-400">
              When active, SOS dispatches and phone calls are simulated safely without carrier fees.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.demoMode}
            onChange={(e) => setFormData({ ...formData, demoMode: e.target.checked })}
            className="w-4 h-4 rounded text-coral-600 focus:ring-coral-500 bg-navy-950 border-white/20"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-xs shadow-lg shadow-coral-600/30 transition-all"
        >
          {saving ? 'Saving changes...' : 'Save Profile & Settings'}
        </button>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-red-950/20 border border-red-500/30 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-300">Delete Account & Safety Records</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanently purges your account, contacts, incident logs, and live tracking sessions.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white">Permanently Delete Account?</h3>
            <p className="text-xs text-slate-300">
              This action cannot be undone. All your emergency contacts and historical incident records will be deleted immediately.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
