const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Incident = require('../models/Incident');
const Contact = require('../models/Contact');
const LocationSession = require('../models/LocationSession');
const { protect } = require('../middleware/auth');
const { emergencyLimiter } = require('../middleware/rateLimiter');
const { dispatchAlerts } = require('../services/notificationService');

// All incident routes require authentication
router.use(protect);

// @route   POST /api/incidents/sos
// @desc    Trigger Emergency SOS incident, create sharing session & dispatch alerts
// @access  Private
router.post('/sos', emergencyLimiter, async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, address, batteryLevel, triggerType } = req.body;

    // Generate unguessable random token for secure location sharing link
    const shareToken = crypto.randomBytes(16).toString('hex');
    const trackingUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/track/${shareToken}`;

    // Get trusted emergency recipients
    const emergencyContacts = await Contact.find({
      user: req.user._id,
      isEmergencyRecipient: true,
    });

    // Create Incident record
    const incident = await Incident.create({
      user: req.user._id,
      status: 'active',
      triggerType: triggerType || 'sos_button',
      isDemo: req.user.demoMode,
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
        accuracy: accuracy || null,
        address: address || (latitude ? `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Location unavailable'),
        capturedAt: new Date(),
      },
      batteryLevel: batteryLevel !== undefined ? batteryLevel : null,
      shareToken,
    });

    // Create linked live location tracking session (active for 2 hours)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const initialCoords = [];
    if (latitude && longitude) {
      initialCoords.push({
        latitude,
        longitude,
        accuracy: accuracy || 10,
        timestamp: new Date(),
      });
    }

    await LocationSession.create({
      user: req.user._id,
      token: shareToken,
      incident: incident._id,
      isActive: true,
      expiresAt,
      label: `Emergency SOS Incident #${incident._id.toString().slice(-4)}`,
      coordinates: initialCoords,
    });

    // Dispatch alerts to trusted contacts
    const alertResults = await dispatchAlerts({
      user: req.user,
      contacts: emergencyContacts,
      incident,
      trackingUrl,
      isDemo: req.user.demoMode,
      alertType: 'SOS_ALERT',
    });

    // Update incident with recipient log
    incident.alertRecipients = alertResults;
    await incident.save();

    res.status(201).json({
      success: true,
      message: 'EMERGENCY SOS ACTIVATED. Alerts dispatched to trusted contacts.',
      incident,
      trackingUrl,
      shareToken,
      recipientsNotifiedCount: alertResults.length,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/incidents/active
// @desc    Get currently active emergency incident for user
// @access  Private
router.get('/active', async (req, res, next) => {
  try {
    const activeIncident = await Incident.findOne({
      user: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      activeIncident,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/incidents/:id/cancel
// @desc    Cancel an accidental SOS activation
// @access  Private
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const incident = await Incident.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident record not found.',
      });
    }

    incident.status = 'cancelled';
    incident.cancellationReason = cancellationReason || 'Cancelled by user (false alarm or drill)';
    incident.resolvedAt = new Date();
    await incident.save();

    // Revoke linked location session
    if (incident.shareToken) {
      await LocationSession.updateOne(
        { token: incident.shareToken },
        { isActive: false, revokedAt: new Date() }
      );
    }

    res.json({
      success: true,
      message: 'Emergency SOS cancelled. Live location sharing stopped.',
      incident,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/incidents/:id/resolve
// @desc    Mark an incident as safely resolved
// @access  Private
router.post('/:id/resolve', async (req, res, next) => {
  try {
    const { resolvedNotes } = req.body;
    const incident = await Incident.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident record not found.',
      });
    }

    incident.status = 'resolved';
    incident.resolvedNotes = resolvedNotes || 'User marked safe.';
    incident.resolvedAt = new Date();
    await incident.save();

    // Revoke linked location session
    if (incident.shareToken) {
      await LocationSession.updateOne(
        { token: incident.shareToken },
        { isActive: false, revokedAt: new Date() }
      );
    }

    res.json({
      success: true,
      message: 'Incident marked as safely resolved. Emergency mode concluded.',
      incident,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/incidents/history
// @desc    Get incident logs and past activations
// @access  Private
router.get('/history', async (req, res, next) => {
  try {
    const incidents = await Incident.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      incidents,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
