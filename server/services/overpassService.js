/**
 * Overpass API Service to fetch real nearby police stations and hospitals from OpenStreetMap
 */

const VERIFIED_REGIONAL_FACILITIES = [
  // New Delhi / NCR
  {
    id: 'fac-del-pol-1',
    name: 'Connaught Place Police Station',
    type: 'police',
    lat: 28.6328,
    lng: 77.2197,
    phone: '011-23747100',
    address: 'Near Shivaji Stadium, Connaught Place, New Delhi',
    verified: true,
  },
  {
    id: 'fac-del-hosp-1',
    name: 'AIIMS (All India Institute of Medical Sciences)',
    type: 'hospital',
    lat: 28.5672,
    lng: 77.2100,
    phone: '011-26588500',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    verified: true,
  },
  {
    id: 'fac-del-pol-2',
    name: 'Parliament Street Police Station',
    type: 'police',
    lat: 28.6235,
    lng: 77.2115,
    phone: '011-23361100',
    address: 'Parliament Street, New Delhi',
    verified: true,
  },
  {
    id: 'fac-del-hosp-2',
    name: 'Dr. Ram Manohar Lohia Hospital',
    type: 'hospital',
    lat: 28.6258,
    lng: 77.2008,
    phone: '011-23365525',
    address: 'Baba Kharak Singh Marg, New Delhi',
    verified: true,
  },
  // Mumbai
  {
    id: 'fac-mum-pol-1',
    name: 'Marine Drive Police Station',
    type: 'police',
    lat: 18.9438,
    lng: 72.8234,
    phone: '022-22811405',
    address: 'Marine Drive, Nariman Point, Mumbai',
    verified: true,
  },
  {
    id: 'fac-mum-hosp-1',
    name: 'KEM Hospital & Medical College',
    type: 'hospital',
    lat: 19.0028,
    lng: 72.8423,
    phone: '022-24107000',
    address: 'Acharya Donde Marg, Parel, Mumbai',
    verified: true,
  },
  // Bengaluru
  {
    id: 'fac-blr-pol-1',
    name: 'Cubbon Park Police Station',
    type: 'police',
    lat: 12.9774,
    lng: 77.5997,
    phone: '080-22942541',
    address: 'Kasturba Road, Bengaluru, Karnataka',
    verified: true,
  },
  {
    id: 'fac-blr-hosp-1',
    name: 'Victoria Hospital (BMCRI)',
    type: 'hospital',
    lat: 12.9634,
    lng: 77.5746,
    phone: '080-26701150',
    address: 'Fort Road, Near City Market, Bengaluru',
    verified: true,
  },
  // Pune
  {
    id: 'fac-pun-pol-1',
    name: 'Shivajinagar Police Station',
    type: 'police',
    lat: 18.5314,
    lng: 73.8446,
    phone: '020-25536333',
    address: 'FC Road, Shivajinagar, Pune, Maharashtra',
    verified: true,
  },
  {
    id: 'fac-pun-hosp-1',
    name: 'Sassoon General Hospital',
    type: 'hospital',
    lat: 18.5262,
    lng: 73.8738,
    phone: '020-26128000',
    address: 'Station Road, Pune',
    verified: true,
  },
];

async function getNearbyFacilities(lat, lng, radiusMeters = 5000) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      facilities: VERIFIED_REGIONAL_FACILITIES.slice(0, 4),
      source: 'verified_directory',
      message: 'Invalid coordinates provided; showing standard verified emergency facilities.',
    };
  }

  // Attempt real Overpass query
  try {
    const query = `
      [out:json][timeout:6];
      (
        node["amenity"="police"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      );
      out body 15;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.elements && data.elements.length > 0) {
        const mapped = data.elements.map((el) => ({
          id: `osm-${el.id}`,
          name: el.tags.name || (el.tags.amenity === 'police' ? 'Police Station' : 'Hospital / Clinic'),
          type: el.tags.amenity,
          lat: el.lat,
          lng: el.lon,
          phone: el.tags['phone'] || el.tags['contact:phone'] || '112',
          address: el.tags['addr:street'] ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}` : 'Location on OpenStreetMap',
          verified: false,
          source: 'OpenStreetMap Overpass',
        }));

        return {
          facilities: mapped,
          source: 'overpass_api',
          count: mapped.length,
        };
      }
    }
  } catch (err) {
    console.warn('Overpass API query failed or timed out:', err.message);
  }

  // Fallback: Calculate nearest verified facilities from our verified list
  const sorted = [...VERIFIED_REGIONAL_FACILITIES].sort((a, b) => {
    const distA = Math.hypot(a.lat - latitude, a.lng - longitude);
    const distB = Math.hypot(b.lat - latitude, b.lng - longitude);
    return distA - distB;
  });

  return {
    facilities: sorted.slice(0, 6),
    source: 'verified_fallback_directory',
    message: 'Live Overpass query unavailable; displaying verified emergency facilities closest to your region.',
  };
}

module.exports = { getNearbyFacilities, VERIFIED_REGIONAL_FACILITIES };
