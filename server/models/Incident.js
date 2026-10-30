const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['triggered', 'active', 'resolved', 'cancelled'],
      default: 'active',
      index: true,
    },
    triggerType: {
      type: String,
      enum: ['sos_button', 'safety_timer_overdue', 'shake_gesture', 'manual_escalation'],
      default: 'sos_button',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      address: { type: String, default: 'Location captured via GPS' },
      capturedAt: { type: Date, default: Date.now },
    },
    batteryLevel: {
      type: Number,
      default: null,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    alertRecipients: [
      {
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        channel: { type: String, default: 'SMS' },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed', 'acknowledged'],
          default: 'pending',
        },
        providerMessageId: { type: String, default: null },
        errorReason: { type: String, default: null },
        dispatchedAt: { type: Date, default: Date.now },
        acknowledgedAt: { type: Date, default: null },
      },
    ],
    cancellationReason: {
      type: String,
      default: null,
    },
    resolvedNotes: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Incident', IncidentSchema);
