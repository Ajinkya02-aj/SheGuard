import '@testing-library/jest-dom';

// Mock Web Audio API
class AudioContextMock {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
    };
  }
  resume() {
    return Promise.resolve();
  }
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock Geolocation API
global.navigator.geolocation = {
  getCurrentPosition: (success) =>
    success({
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 10,
      },
      timestamp: Date.now(),
    }),
  watchPosition: () => 1,
  clearWatch: () => {},
};

// Mock Leaflet
global.L = {
  map: () => ({
    setView: function () { return this; },
    on: function () { return this; },
    remove: function () { return this; },
    panTo: function () { return this; },
  }),
  tileLayer: () => ({ addTo: () => {} }),
  layerGroup: () => ({ addTo: () => {}, clearLayers: () => {} }),
  marker: () => ({ addTo: () => {}, bindPopup: function () { return this; } }),
  circle: () => ({ addTo: () => {} }),
  polyline: () => ({ addTo: () => {} }),
  divIcon: () => ({}),
};
