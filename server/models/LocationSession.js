const mongoose = require('mongoose');

const LocationSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    label: {
      type: String,
      default: 'Emergency Live Tracking Session',
    },
    coordinates: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number, default: 10 },
        heading: { type: Number, default: null },
        speed: { type: Number, default: null },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to verify if session is valid and not expired
LocationSessionSchema.methods.isLive = function () {
  return this.isActive && !this.revokedAt && new Date() < new Date(this.expiresAt);
};

module.exports = mongoose.model('LocationSession', LocationSessionSchema);
