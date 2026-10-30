import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/map/LeafletMap';
import { getCurrentCoordinates } from '../utils/geolocation';
import { emergencyApi } from '../api/client';
import {
  MapPin,
  Navigation,
  Shield,
  PhoneCall,
  Search,
  Cross,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function SafetyMapPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'police' | 'hospital'
  const [destination, setDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [facilitySource, setFacilitySource] = useState('');

  useEffect(() => {
    initMapLocation();
  }, []);

  const initMapLocation = async () => {
    try {
      setLoading(true);
      const coords = await getCurrentCoordinates();
      const loc = {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        address: coords.address,
      };
      setUserLocation(loc);

      // Load nearby facilities
      await loadNearbyFacilities(loc.lat, loc.lng);
    } catch (err) {
      console.warn('Map initialization error:', err);
      setErrorMsg('Could not detect exact GPS position. Using standard regional coordinates.');
      const fallbackLoc = { lat: 28.6139, lng: 77.2090, accuracy: 25, address: 'New Delhi, India' };
      setUserLocation(fallbackLoc);
      await loadNearbyFacilities(fallbackLoc.lat, fallbackLoc.lng);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyFacilities = async (lat, lng) => {
    try {
      const res = await emergencyApi.getNearbyFacilities(lat, lng, 6000);
      setFacilities(res.facilities || []);
      setFacilitySource(res.source || '');
      if (res.message) {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.warn('Facility lookup error:', err);
    }
  };

  const handleMapClick = (latlng) => {
    setDestination({
      lat: latlng.lat,
      lng: latlng.lng,
      name: `Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
    });
  };

  const handleSearchDestination = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // Nominatim search query
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`,
        { headers: { 'User-Agent': 'SHEGUARD-App/1.0' } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          setDestination({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            name: item.display_name.split(',')[0],
          });
        } else {
          alert('No matching location found in India. Try another place name.');
        }
      }
    } catch (err) {
      alert('Search failed: ' + err.message);
    }
  };

  const filteredFacilities = facilities.filter((fac) => {
    if (filterType === 'all') return true;
    return fac.type === filterType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-coral-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Safety Map & Facilities</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GPS positioning, nearby police stations, hospitals, and route markers.
          </p>
        </div>

        <button
          onClick={initMapLocation}
          className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Navigation className="w-4 h-4 text-sky-400" />
          <span>Recenter GPS</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Destination Search & Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchDestination} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search destination in India..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-coral-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold shrink-0 transition-colors"
          >
            Route
          </button>
        </form>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterType === 'all'
                ? 'bg-coral-600/30 text-coral-300 border-coral-500/50'
                : 'bg-navy-900 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            All Facilities ({facilities.length})
          </button>
          <button
            onClick={() => setFilterType('police')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterType === 'police'
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-navy-900 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            👮 Police ({facilities.filter((f) => f.type === 'police').length})
          </button>
          <button
            onClick={() => setFilterType('hospital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterType === 'hospital'
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-navy-900 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            🏥 Hospitals ({facilities.filter((f) => f.type === 'hospital').length})
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-navy-900 rounded-3xl p-3 border border-white/10 shadow-2xl relative overflow-hidden">
        {userLocation && (
          <LeafletMap
            center={[userLocation.lat, userLocation.lng]}
            userLocation={userLocation}
            facilities={filteredFacilities}
            destination={destination}
            onMapClick={handleMapClick}
            className="h-[420px] w-full rounded-2xl"
          />
        )}

        <div className="p-3 bg-navy-950/80 rounded-xl mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <p>
            💡 <strong className="text-white">Tip:</strong> Tap anywhere on the map to set a target destination route.
          </p>
          <span className="text-[11px] text-slate-500">
            Source: {facilitySource === 'overpass_api' ? 'OpenStreetMap Overpass Live' : 'Verified Directory Fallback'}
          </span>
        </div>
      </div>

      {/* Facilities Cards List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nearby Safety Facilities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredFacilities.slice(0, 6).map((fac) => {
            const isPolice = fac.type === 'police';
            return (
              <div
                key={fac.id}
                className="p-4 rounded-2xl bg-navy-900/60 border border-white/5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{isPolice ? '👮' : '🏥'}</span>
                    <h4 className="font-bold text-xs text-white truncate">{fac.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{fac.address || 'Emergency facility'}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <a
                    href={`tel:${fac.phone || '112'}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-coral-400 hover:underline"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call ({fac.phone || '112'})</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white"
                    title="Get Directions"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
