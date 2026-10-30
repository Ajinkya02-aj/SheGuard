const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number is too long'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown',
    },
    medicalNotes: {
      type: String,
      default: '',
      maxlength: [500, 'Medical notes cannot exceed 500 characters'],
    },
    emergencyMessage: {
      type: String,
      default: 'EMERGENCY: I need urgent assistance! This is an automated SHEGUARD SOS alert. Track my live location:',
      maxlength: [200, 'Emergency message cannot exceed 200 characters'],
    },
    primaryEmergencyNumber: {
      type: String,
      default: '112',
    },
    demoMode: {
      type: Boolean,
      default: true,
    },
    locationConsent: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      sms: { type: Boolean, default: true },
      call: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
