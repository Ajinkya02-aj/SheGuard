const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('sheguard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

// Authentication Endpoints
export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (profileData) => apiRequest('/auth/profile', { method: 'PUT', body: profileData }),
  deleteAccount: () => apiRequest('/auth/account', { method: 'DELETE' }),
  resetDemoContacts: () => apiRequest('/auth/demo/reset', { method: 'POST' }),
};

// Trusted Contacts Endpoints
export const contactsApi = {
  getAll: () => apiRequest('/contacts'),
  create: (contact) => apiRequest('/contacts', { method: 'POST', body: contact }),
  update: (id, contact) => apiRequest(`/contacts/${id}`, { method: 'PUT', body: contact }),
  delete: (id) => apiRequest(`/contacts/${id}`, { method: 'DELETE' }),
  testAlert: (id) => apiRequest(`/contacts/${id}/test-alert`, { method: 'POST' }),
};

// Emergency SOS Incidents Endpoints
export const incidentsApi = {
  triggerSOS: (payload) => apiRequest('/incidents/sos', { method: 'POST', body: payload }),
  getActive: () => apiRequest('/incidents/active'),
  cancelSOS: (id, reason) => apiRequest(`/incidents/${id}/cancel`, { method: 'POST', body: { cancellationReason: reason } }),
  resolveSOS: (id, notes) => apiRequest(`/incidents/${id}/resolve`, { method: 'POST', body: { resolvedNotes: notes } }),
  getHistory: () => apiRequest('/incidents/history'),
};

// Location Sharing Endpoints
export const locationApi = {
  startSession: (payload) => apiRequest('/location/start', { method: 'POST', body: payload }),
  updateCoordinates: (payload) => apiRequest('/location/update', { method: 'POST', body: payload }),
  stopSession: (payload) => apiRequest('/location/stop', { method: 'POST', body: payload }),
  getActiveSession: () => apiRequest('/location/active'),
  getPublicTracking: (token) => apiRequest(`/location/track/${token}`),
};

// Safety Arrival Timer Endpoints
export const timerApi = {
  start: (payload) => apiRequest('/timer/start', { method: 'POST', body: payload }),
  getActive: () => apiRequest('/timer/active'),
  checkIn: () => apiRequest('/timer/checkin', { method: 'POST' }),
  cancel: () => apiRequest('/timer/cancel', { method: 'POST' }),
  escalate: (payload) => apiRequest('/timer/escalate', { method: 'POST', body: payload }),
};

// Emergency Directory & Facilities Endpoints
export const emergencyApi = {
  getServices: () => apiRequest('/emergency/services'),
  getNearbyFacilities: (lat, lng, radius) => apiRequest(`/emergency/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`),
};
