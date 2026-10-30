const express = require('express');
const router = express.Router();
const { getNearbyFacilities } = require('../services/overpassService');

const OFFICIAL_INDIAN_EMERGENCY_SERVICES = [
  {
    id: 'em-112',
    name: 'National Emergency Response Support System (ERSS)',
    shortCode: '112',
    category: 'Universal Emergency',
    description: 'Single national emergency number across India integrating Police, Fire, Ambulance, and Disaster management.',
    availability: '24/7 Toll-Free',
    isPrimary: true,
    speedDial: 'tel:112',
  },
  {
    id: 'em-1091',
    name: 'Women in Distress Helpline',
    shortCode: '1091',
    category: 'Women Safety',
    description: 'Dedicated police assistance for women facing harassment, stalking, or imminent threat.',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:1091',
  },
  {
    id: 'em-181',
    name: 'Women Helpline (Domestic Violence / Distress)',
    shortCode: '181',
    category: 'Women Safety & Counseling',
    description: 'Comprehensive crisis intervention, legal counsel, and shelter support for women affected by violence.',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:181',
  },
  {
    id: 'em-100',
    name: 'Police Emergency Response',
    shortCode: '100',
    category: 'Police',
    description: 'Direct city/state police emergency control room.',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:100',
  },
  {
    id: 'em-108',
    name: 'Ambulance & Emergency Medical Response',
    shortCode: '108',
    category: 'Medical',
    description: 'Emergency ambulance dispatch and on-scene paramedic response (108 / 102).',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:108',
  },
  {
    id: 'em-101',
    name: 'Fire & Rescue Services',
    shortCode: '101',
    category: 'Fire',
    description: 'Emergency fire brigade dispatch and building evacuation services.',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:101',
  },
  {
    id: 'em-1930',
    name: 'National Cyber Crime Reporting Helpline',
    shortCode: '1930',
    category: 'Cyber Safety',
    description: 'Immediate reporting of online financial fraud, cyber-stalking, blackmail, non-consensual image abuse.',
    availability: '24/7 Toll-Free',
    isPrimary: false,
    speedDial: 'tel:1930',
  },
  {
    id: 'em-ncw',
    name: 'National Commission for Women (NCW) WhatsApp',
    shortCode: '7827170170',
    category: 'Women Rights Support',
    description: '24/7 dedicated WhatsApp grievance helpline for women facing violence.',
    availability: '24/7 Online / WhatsApp',
    isPrimary: false,
    speedDial: 'https://wa.me/917827170170',
  },
];

// @route   GET /api/emergency/services
// @desc    Get verified official emergency services directory
// @access  Public
router.get('/services', (req, res) => {
  res.json({
    success: true,
    country: 'India',
    services: OFFICIAL_INDIAN_EMERGENCY_SERVICES,
    disclaimer:
      'SHEGUARD provides tap-to-call shortcuts to launch your device telephone dialer. The application cannot guarantee connectivity, network carrier coverage, or operator response times.',
  });
});

// @route   GET /api/emergency/nearby
// @desc    Get nearby police stations and hospitals based on coordinates
// @access  Public
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    const facilitiesData = await getNearbyFacilities(lat, lng, radius);

    res.json({
      success: true,
      ...facilitiesData,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
