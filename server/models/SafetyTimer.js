const mongoose = require('mongoose');

const SafetyTimerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination or trip purpose is required'],
      trim: true,
      maxlength: [120, 'Destination description too long'],
    },
    notes: {
      type: String,
      default: '',
      maxlength: [300, 'Notes too long'],
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 720,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    expectedArrivalTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'safe', 'overdue', 'cancelled'],
      default: 'running',
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    selectedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SafetyTimer', SafetyTimerSchema);
