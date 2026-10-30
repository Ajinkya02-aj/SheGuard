const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Incident = require('../models/Incident');
const LocationSession = require('../models/LocationSession');
const SafetyTimer = require('../models/SafetyTimer');
const NotificationLog = require('../models/NotificationLog');
const { protect, JWT_SECRET } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Helper to generate JWT token
function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
}

// Seed sample contacts for new users so the emergency system is instantly ready to test
async function seedDefaultContacts(userId) {
  const defaults = [
    {
      user: userId,
      name: 'Pooja Sharma',
      relationship: 'Sister',
      phone: '+91 98765 43210',
      email: 'pooja.sharma.demo@example.com',
      isEmergencyRecipient: true,
      preferredChannel: 'SMS',
      isVerified: true,
    },
    {
      user: userId,
      name: 'Dr. Rajesh Verma',
      relationship: 'Father',
      phone: '+91 98111 22334',
      email: 'rajesh.verma.demo@example.com',
      isEmergencyRecipient: true,
      preferredChannel: 'All',
      isVerified: true,
    },
    {
      user: userId,
      name: 'Neha Patel',
      relationship: 'Friend',
      phone: '+91 97234 56789',
      email: 'neha.patel.demo@example.com',
      isEmergencyRecipient: true,
      preferredChannel: 'SMS',
      isVerified: false,
    },
  ];

  await Contact.insertMany(defaults);
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, password, bloodGroup, medicalNotes, demoMode } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      bloodGroup: bloodGroup || 'Unknown',
      medicalNotes: medicalNotes || '',
      demoMode: demoMode !== undefined ? demoMode : true,
    });

    // Seed default demo contacts so user has a ready-to-use safety network
    await seedDefaultContacts(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        medicalNotes: user.medicalNotes,
        demoMode: user.demoMode,
        locationConsent: user.locationConsent,
        primaryEmergencyNumber: user.primaryEmergencyNumber,
        emergencyMessage: user.emergencyMessage,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        medicalNotes: user.medicalNotes,
        demoMode: user.demoMode,
        locationConsent: user.locationConsent,
        primaryEmergencyNumber: user.primaryEmergencyNumber,
        emergencyMessage: user.emergencyMessage,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & preferences
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'bloodGroup',
      'medicalNotes',
      'emergencyMessage',
      'primaryEmergencyNumber',
      'demoMode',
      'locationConsent',
      'notificationPreferences',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/auth/account
// @desc    Permanently delete user account and associated personal safety records
// @access  Private
router.delete('/account', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Contact.deleteMany({ user: userId });
    await Incident.deleteMany({ user: userId });
    await LocationSession.deleteMany({ user: userId });
    await SafetyTimer.deleteMany({ user: userId });
    await NotificationLog.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Your SHEGUARD account and all associated data have been permanently deleted.',
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/demo/reset
// @desc    Reset user's trusted contacts to demo baseline
// @access  Private
router.post('/demo/reset', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Contact.deleteMany({ user: userId });
    await seedDefaultContacts(userId);
    const contacts = await Contact.find({ user: userId });

    res.json({
      success: true,
      message: 'Demo contacts restored to default safety network.',
      contacts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
