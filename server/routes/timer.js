const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const SafetyTimer = require('../models/SafetyTimer');
const Contact = require('../models/Contact');
const Incident = require('../models/Incident');
const LocationSession = require('../models/LocationSession');
const { protect } = require('../middleware/auth');
const { dispatchAlerts } = require('../services/notificationService');

router.use(protect);

// @route   POST /api/timer/start
// @desc    Start a travel/meeting safety arrival timer
router.post('/start', async (req, res, next) => {
  try {
    const { destination, notes, durationMinutes = 30, selectedContacts } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination or trip purpose is required.',
      });
    }

    const duration = Math.min(Math.max(parseInt(durationMinutes, 10) || 30, 1), 720);
    const expectedArrivalTime = new Date(Date.now() + duration * 60 * 1000);

    // Cancel any previous running timers for this user
    await SafetyTimer.updateMany(
      { user: req.user._id, status: 'running' },
      { status: 'cancelled' }
    );

    // Default to all emergency contacts if none selected
    let contactIds = selectedContacts;
    if (!contactIds || contactIds.length === 0) {
      const allEmergency = await Contact.find({ user: req.user._id, isEmergencyRecipient: true });
      contactIds = allEmergency.map((c) => c._id);
    }

    const timer = await SafetyTimer.create({
      user: req.user._id,
      destination: destination.trim(),
      notes: notes ? notes.trim() : '',
      durationMinutes: duration,
      expectedArrivalTime,
      selectedContacts: contactIds,
      status: 'running',
    });

    res.status(201).json({
      success: true,
      message: `Safety timer set for ${duration} minutes.`,
      timer,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/timer/active
// @desc    Get currently active timer and check for overdue status
router.get('/active', async (req, res, next) => {
  try {
    const timer = await SafetyTimer.findOne({
      user: req.user._id,
      status: { $in: ['running', 'overdue'] },
    })
      .populate('selectedContacts', 'name phone relationship')
      .sort({ createdAt: -1 });

    if (!timer) {
      return res.json({
        success: true,
        timer: null,
      });
    }

    // Auto-check if overdue
    if (timer.status === 'running' && new Date() > new Date(timer.expectedArrivalTime)) {
      timer.status = 'overdue';
      await timer.save();
    }

    res.json({
      success: true,
      timer,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/timer/checkin
// @desc    User confirms safe arrival, concludes timer
router.post('/checkin', async (req, res, next) => {
  try {
    const timer = await SafetyTimer.findOne({
      user: req.user._id,
      status: { $in: ['running', 'overdue'] },
    }).sort({ createdAt: -1 });

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'No active safety timer found to check in.',
      });
    }

    timer.status = 'safe';
    timer.checkedInAt = new Date();
    await timer.save();

    res.json({
      success: true,
      message: 'You have safely checked in! Safety timer marked as complete.',
      timer,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/timer/cancel
// @desc    Cancel safety timer
router.post('/cancel', async (req, res, next) => {
  try {
    const timer = await SafetyTimer.findOne({
      user: req.user._id,
      status: { $in: ['running', 'overdue'] },
    }).sort({ createdAt: -1 });

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'No active safety timer found.',
      });
    }

    timer.status = 'cancelled';
    await timer.save();

    res.json({
      success: true,
      message: 'Safety timer cancelled.',
      timer,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/timer/escalate
// @desc    Escalate overdue timer to alert trusted contacts
router.post('/escalate', async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    const timer = await SafetyTimer.findOne({
      user: req.user._id,
      status: { $in: ['running', 'overdue'] },
    }).populate('selectedContacts');

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Active timer not found.',
      });
    }

    const shareToken = crypto.randomBytes(16).toString('hex');
    const trackingUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/track/${shareToken}`;

    // Create Incident for missed arrival
    const incident = await Incident.create({
      user: req.user._id,
      status: 'active',
      triggerType: 'safety_timer_overdue',
      isDemo: req.user.demoMode,
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
        accuracy: accuracy || null,
        address: `Missed arrival check-in for: ${timer.destination}`,
        capturedAt: new Date(),
      },
      shareToken,
    });

    // Create linked location session
    await LocationSession.create({
      user: req.user._id,
      token: shareToken,
      incident: incident._id,
      isActive: true,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      label: `Safety Timer Overdue: ${timer.destination}`,
      coordinates: latitude && longitude ? [{ latitude, longitude, accuracy: accuracy || 10 }] : [],
    });

    const overdueMessage = `[SHEGUARD TIMER ALERT] ${req.user.name} missed a scheduled arrival check-in for "${timer.destination}". Please contact them immediately or track their last known location here: ${trackingUrl}`;

    const alertResults = await dispatchAlerts({
      user: req.user,
      contacts: timer.selectedContacts,
      incident,
      customMessage: overdueMessage,
      trackingUrl,
      isDemo: req.user.demoMode,
      alertType: 'TIMER_OVERDUE',
    });

    timer.status = 'overdue';
    timer.escalatedAt = new Date();
    timer.incident = incident._id;
    await timer.save();

    res.json({
      success: true,
      message: 'Overdue timer escalated. Alerts dispatched to trusted contacts.',
      incident,
      trackingUrl,
      recipients: alertResults,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
