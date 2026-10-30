const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
    },
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['SOS_ALERT', 'TIMER_OVERDUE', 'TEST_ALERT', 'CHECKIN_CONFIRM', 'LOCATION_SHARED'],
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['SMS', 'WhatsApp', 'Push', 'Email', 'All'],
      default: 'SMS',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'acknowledged'],
      default: 'sent',
    },
    providerMessageId: {
      type: String,
      default: null,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
