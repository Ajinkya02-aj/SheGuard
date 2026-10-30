import React, { useState, useEffect } from 'react';
import { contactsApi, authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Send,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Heart,
  Shield,
  RotateCcw,
} from 'lucide-react';

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [testAlertStatus, setTestAlertStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Friend',
    phone: '',
    email: '',
    preferredChannel: 'SMS',
    isEmergencyRecipient: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await contactsApi.getAll();
      setContacts(res.contacts || []);
    } catch (err) {
      console.warn('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: 'Friend',
      phone: '',
      email: '',
      preferredChannel: 'SMS',
      isEmergencyRecipient: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || '',
      preferredChannel: contact.preferredChannel || 'SMS',
      isEmergencyRecipient: contact.isEmergencyRecipient,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Name and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingContact) {
        await contactsApi.update(editingContact._id, formData);
      } else {
        await contactsApi.create(formData);
      }
      setModalOpen(false);
      await fetchContacts();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your trusted emergency contacts?`)) return;
    try {
      await contactsApi.delete(id);
      await fetchContacts();
    } catch (err) {
      alert('Failed to remove contact: ' + err.message);
    }
  };

  const handleToggleRecipient = async (contact) => {
    try {
      await contactsApi.update(contact._id, {
        isEmergencyRecipient: !contact.isEmergencyRecipient,
      });
      await fetchContacts();
    } catch (err) {
      alert('Failed to update contact: ' + err.message);
    }
  };

  const handleSendTestAlert = async (contact) => {
    try {
      setTestAlertStatus({ contactId: contact._id, state: 'sending' });
      const res = await contactsApi.testAlert(contact._id);
      setTestAlertStatus({
        contactId: contact._id,
        state: 'success',
        message: res.message || `Test alert sent to ${contact.name}`,
      });
      setTimeout(() => setTestAlertStatus(null), 5000);
      await fetchContacts();
    } catch (err) {
      setTestAlertStatus({
        contactId: contact._id,
        state: 'error',
        message: err.message || 'Failed to dispatch test notification.',
      });
      setTimeout(() => setTestAlertStatus(null), 5000);
    }
  };

  const handleResetDemoContacts = async () => {
    if (!window.confirm('Restore standard sample emergency contacts (Pooja Sharma, Dr. Rajesh Verma, Neha Patel)?')) return;
    try {
      await authApi.resetDemoContacts();
      await fetchContacts();
    } catch (err) {
      alert('Failed to reset contacts: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-coral-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Trusted Safety Network</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            These individuals receive your SOS alerts, location link, and travel notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.demoMode && (
            <button
              onClick={handleResetDemoContacts}
              className="px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset default demo contacts"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Demo Contacts</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-xs shadow-lg shadow-coral-600/30 flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Test Alert Banner Status */}
      {testAlertStatus && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            testAlertStatus.state === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : testAlertStatus.state === 'error'
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {testAlertStatus.state === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{testAlertStatus.message || 'Dispatching test notification...'}</span>
        </div>
      )}

      {/* Contacts List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading trusted contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-navy-900/50 rounded-3xl border border-dashed border-white/10 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Emergency Contacts Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add at least 1-3 trusted family members or friends who should be immediately alerted when you trigger SOS.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-coral-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className={`p-5 rounded-3xl border transition-all ${
                contact.isEmergencyRecipient
                  ? 'bg-navy-900/80 border-white/10 shadow-lg'
                  : 'bg-navy-950/60 border-white/5 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{contact.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-800 text-coral-300 border border-white/10">
                      {contact.relationship}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contact.phone}</span>
                  </div>

                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-2 rounded-lg bg-navy-800/80 hover:bg-navy-700 text-slate-300 transition-colors"
                    title="Edit contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact._id, contact.name)}
                    className="p-2 rounded-lg bg-navy-800/80 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleRecipient(contact)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    contact.isEmergencyRecipient
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-navy-950 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{contact.isEmergencyRecipient ? 'SOS Recipient (Active)' : 'SOS Alert Disabled'}</span>
                </button>

                <button
                  onClick={() => handleSendTestAlert(contact)}
                  className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-coral-300 border border-coral-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Test SMS notification channel"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Alert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white">
              {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Contact Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Friend">Friend</option>
                    <option value="Partner">Partner</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Notification Channel</label>
                  <select
                    value={formData.preferredChannel}
                    onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value })}
                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="All">All Channels</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone Number (India +91)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Receive SOS Alerts</p>
                  <p className="text-[11px] text-slate-400">Transmit live GPS link during emergencies</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isEmergencyRecipient}
                  onChange={(e) => setFormData({ ...formData, isEmergencyRecipient: e.target.checked })}
                  className="w-4 h-4 rounded text-coral-600 focus:ring-coral-500 bg-navy-900 border-white/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold shadow-md shadow-coral-600/30"
                >
                  {submitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
