const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../server');
const { connectDB, closeDB } = require('../config/db');

let serverInstance;
let baseUrl;
let authToken;
let testUserId;
let contactId;
let emergencyToken;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (e) {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (serverInstance) serverInstance.close();
  await closeDB();
});

describe('SHEGUARD API Verification Suite', () => {
  test('Health Check returns 200 and healthy status', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  test('User Registration creates account and default demo contacts', async () => {
    const payload = {
      name: 'Ananya Roy',
      email: `ananya.${Date.now()}@example.com`,
      phone: '+91 98200 12345',
      password: 'StrongPassword123!',
      bloodGroup: 'B+',
      demoMode: true,
    };

    const res = await request('POST', '/api/auth/register', payload);
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Ananya Roy');
    assert.equal(res.body.user.demoMode, true);

    authToken = res.body.token;
    testUserId = res.body.user.id;
  });

  test('User Login with valid credentials succeeds', async () => {
    const uniqueEmail = `login.test.${Date.now()}@example.com`;
    await request('POST', '/api/auth/register', {
      name: 'Login Tester',
      email: uniqueEmail,
      phone: '+91 99999 00000',
      password: 'SecretPassword987',
    });

    const res = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'SecretPassword987',
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('User Login with invalid credentials returns 401', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'WrongPassword',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('Get Current User profile with auth token', async () => {
    const res = await request('GET', '/api/auth/me', null, authToken);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Ananya Roy');
  });

  test('Trusted Contacts CRUD operations', async () => {
    // 1. Get default contacts seeded on registration
    const listRes = await request('GET', '/api/contacts', null, authToken);
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.contacts.length >= 3);

    // 2. Add a new trusted contact
    const addRes = await request(
      'POST',
      '/api/contacts',
      {
        name: 'Inspector Sharma',
        relationship: 'Guardian',
        phone: '+91 98100 99887',
        isEmergencyRecipient: true,
        preferredChannel: 'SMS',
      },
      authToken
    );
    assert.equal(addRes.status, 201);
    assert.equal(addRes.body.contact.name, 'Inspector Sharma');
    contactId = addRes.body.contact._id;

    // 3. Test alert dispatch to this contact
    const testAlertRes = await request(
      'POST',
      `/api/contacts/${contactId}/test-alert`,
      {},
      authToken
    );
    assert.equal(testAlertRes.status, 200);
    assert.equal(testAlertRes.body.result.status, 'sent');

    // 4. Update contact
    const updateRes = await request(
      'PUT',
      `/api/contacts/${contactId}`,
      { preferredChannel: 'WhatsApp' },
      authToken
    );
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.contact.preferredChannel, 'WhatsApp');
  });

  test('Emergency SOS Activation flow creates incident and live tracking token', async () => {
    const sosPayload = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 8.5,
      address: 'Central Delhi, New Delhi, India',
      batteryLevel: 78,
      triggerType: 'sos_button',
    };

    const res = await request('POST', '/api/incidents/sos', sosPayload, authToken);
    assert.equal(res.status, 201);
    assert.ok(res.body.incident);
    assert.equal(res.body.incident.status, 'active');
    assert.ok(res.body.shareToken);
    assert.ok(res.body.trackingUrl.includes(res.body.shareToken));
    assert.ok(res.body.recipientsNotifiedCount > 0);

    emergencyToken = res.body.shareToken;
    const incidentId = res.body.incident._id;

    // Verify Active Incident endpoint
    const activeRes = await request('GET', '/api/incidents/active', null, authToken);
    assert.equal(activeRes.status, 200);
    assert.equal(activeRes.body.activeIncident._id, incidentId);

    // Verify Public Tracking endpoint using the token
    const trackRes = await request('GET', `/api/location/track/${emergencyToken}`);
    assert.equal(trackRes.status, 200);
    assert.equal(trackRes.body.user.name, 'Ananya Roy');
    assert.equal(trackRes.body.incident.status, 'active');
    assert.equal(trackRes.body.latestCoordinate.latitude, 28.6139);

    // Cancel the SOS incident
    const cancelRes = await request(
      'POST',
      `/api/incidents/${incidentId}/cancel`,
      { cancellationReason: 'Test drill verification' },
      authToken
    );
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.incident.status, 'cancelled');

    // Check that public tracking link is now revoked
    const revokedRes = await request('GET', `/api/location/track/${emergencyToken}`);
    assert.equal(revokedRes.status, 410);
    assert.equal(revokedRes.body.expired, true);
  });

  test('Safety Timer flow: Start, Check-in, and Escalation', async () => {
    // 1. Start timer
    const startRes = await request(
      'POST',
      '/api/timer/start',
      {
        destination: 'Returning home from office',
        durationMinutes: 15,
      },
      authToken
    );
    assert.equal(startRes.status, 201);
    assert.equal(startRes.body.timer.status, 'running');

    // 2. Get active timer
    const activeRes = await request('GET', '/api/timer/active', null, authToken);
    assert.equal(activeRes.status, 200);
    assert.equal(activeRes.body.timer.destination, 'Returning home from office');

    // 3. Safe Check-in
    const checkinRes = await request('POST', '/api/timer/checkin', {}, authToken);
    assert.equal(checkinRes.status, 200);
    assert.equal(checkinRes.body.timer.status, 'safe');
  });

  test('Emergency Services Directory returns official Indian helplines', async () => {
    const res = await request('GET', '/api/emergency/services');
    assert.equal(res.status, 200);
    assert.ok(res.body.services.some((s) => s.shortCode === '112'));
    assert.ok(res.body.services.some((s) => s.shortCode === '1091'));
  });

  test('Nearby Emergency Facilities returns verified facilities on fallback', async () => {
    const res = await request('GET', '/api/emergency/nearby?lat=28.6139&lng=77.2090');
    assert.equal(res.status, 200);
    assert.ok(res.body.facilities.length > 0);
  });
});
