// Geolocation & Device Sensor Utilities

export const DEMO_PRESET_LOCATIONS = [
  { name: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'FC Road, Pune', lat: 18.5284, lng: 73.8415 },
];

export async function getCurrentCoordinates(isDemo = false) {
  if (isDemo && typeof window !== 'undefined' && localStorage.getItem('sheguard_force_demo_gps') === 'true') {
    return {
      latitude: DEMO_PRESET_LOCATIONS[0].lat,
      longitude: DEMO_PRESET_LOCATIONS[0].lng,
      accuracy: 5,
      timestamp: Date.now(),
      address: DEMO_PRESET_LOCATIONS[0].name,
      isSimulated: true,
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to demo location if browser does not support geolocation
      resolve({
        latitude: DEMO_PRESET_LOCATIONS[0].lat,
        longitude: DEMO_PRESET_LOCATIONS[0].lng,
        accuracy: 25,
        timestamp: Date.now(),
        address: 'Delhi NCR (Simulated - Geolocation Unsupported)',
        isSimulated: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let address = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        try {
          // Attempt reverse geocoding via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
            { headers: { 'User-Agent': 'SHEGUARD-Safety-App/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch (e) {
          // Keep default coordinate string
        }

        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          timestamp: pos.timestamp,
          address,
          isSimulated: false,
        });
      },
      (err) => {
        console.warn('Geolocation access failed or denied:', err.message);
        // Fallback for safety rather than completely crashing the SOS feature
        resolve({
          latitude: DEMO_PRESET_LOCATIONS[0].lat,
          longitude: DEMO_PRESET_LOCATIONS[0].lng,
          accuracy: 50,
          timestamp: Date.now(),
          address: 'Approximate Location (GPS permission denied)',
          isSimulated: true,
          permissionDenied: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  });
}

export async function getDeviceBatteryLevel() {
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    }
  } catch (err) {
    // Battery API unavailable
  }
  return null;
}
