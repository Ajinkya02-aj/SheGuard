const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const LocationSession = require('../models/LocationSession');
const User = require('../models/User');
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');

// @route   GET /api/location/track/:token
// @desc    Public access endpoint for authorized trusted contacts with unguessable token
// @access  Public (Access controlled via unguessable token & strict expiration)
router.get('/track/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 16) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking token format.',
      });
    }

    const session = await LocationSession.findOne({ token }).populate('incident');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Tracking link not found or invalid.',
      });
    }

    const now = new Date();
    const isExpired = now > new Date(session.expiresAt);
    const isRevoked = !session.isActive || Boolean(session.revokedAt);

    if (isExpired || isRevoked) {
      return res.status(410).json({
        success: false,
        expired: true,
        message: isRevoked
          ? 'This tracking session was terminated by the user.'
          : 'This tracking link has expired for security and privacy.',
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
      });
    }

    // Fetch sanitized user info
    const user = await User.findById(session.user).select(
      'name bloodGroup medicalNotes emergencyMessage primaryEmergencyNumber'
    );

    const latestCoordinate = session.coordinates.length > 0 ? session.coordinates[session.coordinates.length - 1] : null;

    res.json({
      success: true,
      session: {
        token: session.token,
        label: session.label,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
        durationMinutes: session.durationMinutes,
      },
      user: {
        name: user ? user.name : 'SHEGUARD User',
        bloodGroup: user ? user.bloodGroup : 'Unknown',
        emergencyMessage: user ? user.emergencyMessage : '',
        primaryEmergencyNumber: user ? user.primaryEmergencyNumber : '112',
      },
      latestCoordinate,
      coordinates: session.coordinates.slice(-25), // Return last 25 breadcrumbs
      incident: session.incident
        ? {
            status: session.incident.status,
            triggerType: session.incident.triggerType,
            batteryLevel: session.incident.batteryLevel,
            capturedAt: session.incident.location?.capturedAt,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// All routes below require user authentication
router.use(protect);

// @route   POST /api/location/start
// @desc    Start a time-limited live location sharing session
// @access  Private
router.post('/start', async (req, res, next) => {
  try {
    const { durationMinutes = 30, label, latitude, longitude, accuracy } = req.body;

    const token = crypto.randomBytes(16).toString('hex');
    const safeDuration = Math.min(Math.max(parseInt(durationMinutes, 10) || 30, 5), 240); // 5 min to 4 hours
    const expiresAt = new Date(Date.now() + safeDuration * 60 * 1000);

    const initialCoords = [];
    if (latitude && longitude) {
      initialCoords.push({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : 10,
        timestamp: new Date(),
      });
    }

    const session = await LocationSession.create({
      user: req.user._id,
      token,
      durationMinutes: safeDuration,
      expiresAt,
      label: label || 'Live Travel Sharing',
      coordinates: initialCoords,
      isActive: true,
    });

    const publicUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/track/${token}`;

    res.status(201).json({
      success: true,
      message: 'Live location sharing session created.',
      session,
      trackingUrl: publicUrl,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/location/update
// @desc    Push latest GPS breadcrumb to active session
// @access  Private
router.post('/update', async (req, res, next) => {
  try {
    const { token, latitude, longitude, accuracy, heading, speed } = req.body;

    if (!token || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Token and valid coordinates are required.',
      });
    }

    const session = await LocationSession.findOne({
      token,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Tracking session not found.',
      });
    }

    if (!session.isActive || new Date() > new Date(session.expiresAt)) {
      return res.status(410).json({
        success: false,
        expired: true,
        message: 'Tracking session is no longer active.',
      });
    }

    const newCoord = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : 10,
      heading: heading || null,
      speed: speed || null,
      timestamp: new Date(),
    };

    session.coordinates.push(newCoord);
    // Limit stored coordinates per session to 200 points to avoid memory bloat
    if (session.coordinates.length > 200) {
      session.coordinates = session.coordinates.slice(-200);
    }

    await session.save();

    res.json({
      success: true,
      message: 'Location breadcrumb recorded.',
      latestCoordinate: newCoord,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/location/stop
// @desc    Revoke and stop live sharing session
// @access  Private
router.post('/stop', async (req, res, next) => {
  try {
    const { token } = req.body;

    const query = { user: req.user._id, isActive: true };
    if (token) query.token = token;

    const session = await LocationSession.findOne(query).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active sharing session not found.',
      });
    }

    session.isActive = false;
    session.revokedAt = new Date();
    await session.save();

    res.json({
      success: true,
      message: 'Live location sharing has been safely stopped.',
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/location/active
// @desc    Get current user's active location session
// @access  Private
router.get('/active', async (req, res, next) => {
  try {
    const activeSession = await LocationSession.findOne({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      activeSession,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
