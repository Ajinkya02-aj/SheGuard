const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [80, 'Contact name is too long'],
    },
    relationship: {
      type: String,
      enum: ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Partner', 'Guardian', 'Colleague', 'Other'],
      default: 'Friend',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number is too long'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    isEmergencyRecipient: {
      type: Boolean,
      default: true,
    },
    preferredChannel: {
      type: String,
      enum: ['SMS', 'WhatsApp', 'Call', 'All'],
      default: 'SMS',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
