import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap({
  center = [28.6139, 77.2090],
  zoom = 14,
  userLocation = null,
  facilities = [],
  destination = null,
  onMapClick = null,
  className = 'h-96 w-full rounded-2xl',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, zoom);

      // OpenStreetMap Carto tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and view when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. User Location Marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-coral-500/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-coral-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: 'custom-user-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(`
          <div class="text-xs space-y-1">
            <strong class="text-coral-400 font-bold">Your Location</strong>
            <p class="text-slate-300">${userLocation.address || 'GPS Position'}</p>
            <p class="text-[10px] text-slate-400">Accuracy: ~${userLocation.accuracy || 10}m</p>
          </div>
        `)
        .addTo(layers);

      if (userLocation.accuracy) {
        L.circle([userLocation.lat, userLocation.lng], {
          radius: userLocation.accuracy,
          color: '#FF4D6D',
          fillColor: '#FF4D6D',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(layers);
      }

      map.panTo([userLocation.lat, userLocation.lng]);
    }

    // 2. Facilities (Police & Hospitals)
    facilities.forEach((fac) => {
      const isPolice = fac.type === 'police';
      const iconColor = isPolice ? 'bg-blue-600' : 'bg-emerald-600';
      const symbol = isPolice ? '👮' : '🏥';

      const facHtml = `
        <div class="w-7 h-7 rounded-full ${iconColor} border-2 border-white shadow-md flex items-center justify-center text-xs text-white">
          ${symbol}
        </div>
      `;

      const facIcon = L.divIcon({
        html: facHtml,
        className: 'custom-fac-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([fac.lat, fac.lng], { icon: facIcon })
        .bindPopup(`
          <div class="text-xs space-y-1.5 min-w-[160px]">
            <strong class="font-bold ${isPolice ? 'text-blue-400' : 'text-emerald-400'}">${fac.name}</strong>
            <p class="text-[11px] text-slate-300">${fac.address || ''}</p>
            ${fac.phone ? `<p class="text-[11px]"><a href="tel:${fac.phone}" class="text-coral-400 underline font-semibold">Call: ${fac.phone}</a></p>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" target="_blank" rel="noopener noreferrer" class="inline-block mt-1 text-[10px] text-sky-400 underline">
              Open Navigation Directions
            </a>
          </div>
        `)
        .addTo(layers);
    });

    // 3. Destination Marker & Routing Line
    if (destination && destination.lat && destination.lng) {
      const destHtml = `
        <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-xs text-black font-bold">
          📍
        </div>
      `;
      const destIcon = L.divIcon({
        html: destHtml,
        className: 'custom-dest-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`
          <div class="text-xs">
            <strong class="text-amber-400 font-bold">Destination</strong>
            <p class="text-slate-300">${destination.name || 'Selected Point'}</p>
          </div>
        `)
        .addTo(layers);

      if (userLocation && userLocation.lat && userLocation.lng) {
        L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [destination.lat, destination.lng],
          ],
          {
            color: '#F59E0B',
            dashArray: '6, 8',
            weight: 3,
            opacity: 0.8,
          }
        ).addTo(layers);
      }
    }
  }, [userLocation, facilities, destination]);

  return <div ref={mapContainerRef} className={className} />;
}
