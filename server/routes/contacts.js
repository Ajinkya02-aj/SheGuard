const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const NotificationLog = require('../models/NotificationLog');
const { protect } = require('../middleware/auth');
const { dispatchAlerts } = require('../services/notificationService');

// All contact routes require authentication
router.use(protect);

// @route   GET /api/contacts
// @desc    Get all trusted contacts for logged in user
router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/contacts
// @desc    Create a new trusted contact
router.post('/', async (req, res, next) => {
  try {
    const { name, relationship, phone, email, isEmergencyRecipient, preferredChannel } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.',
      });
    }

    // Check contact limit for safety & rate control (max 10 contacts)
    const existingCount = await Contact.countDocuments({ user: req.user._id });
    if (existingCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 10 trusted contacts reached.',
      });
    }

    const contact = await Contact.create({
      user: req.user._id,
      name: name.trim(),
      relationship: relationship || 'Friend',
      phone: phone.trim(),
      email: email ? email.trim() : '',
      isEmergencyRecipient: isEmergencyRecipient !== undefined ? isEmergencyRecipient : true,
      preferredChannel: preferredChannel || 'SMS',
    });

    res.status(201).json({
      success: true,
      message: `${contact.name} added to trusted contacts.`,
      contact,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update trusted contact
router.put('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Trusted contact not found or access denied.',
      });
    }

    const fields = ['name', 'relationship', 'phone', 'email', 'isEmergencyRecipient', 'preferredChannel', 'isVerified'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    });

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully.',
      contact,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Remove trusted contact
router.delete('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Trusted contact not found.',
      });
    }

    res.json({
      success: true,
      message: `${contact.name} removed from your trusted safety network.`,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/contacts/:id/test-alert
// @desc    Send a test emergency notification to check channel delivery
router.post('/:id/test-alert', async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Trusted contact not found.',
      });
    }

    const testMessage = `[SHEGUARD TEST] Hi ${contact.name}, ${req.user.name} has added you as a trusted emergency contact on SHEGUARD. No action is required. In a real emergency, you will receive alert updates and live GPS tracking here.`;

    const dispatchResults = await dispatchAlerts({
      user: req.user,
      contacts: [contact],
      customMessage: testMessage,
      isDemo: req.user.demoMode,
      alertType: 'TEST_ALERT',
    });

    contact.lastNotifiedAt = new Date();
    await contact.save();

    res.json({
      success: true,
      message: `Test alert sent to ${contact.name}.`,
      result: dispatchResults[0] || { status: 'sent' },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
