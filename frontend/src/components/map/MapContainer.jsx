import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MAP_CONFIG } from '../../utils/constants';
import { getMapMarkers, reverseGeocode, getLocationDetails } from '../../services/api';
import { useLocation } from '../../context/LocationContext';

const getRiskColor = (risk) => {
  switch (risk) {
    case 'Critical':
      return '#dc2626';
    case 'High':
      return '#ea580c';
    case 'Medium':
      return '#d97706';
    case 'Low':
      return '#16a34a';
    default:
      return '#16a34a';
  }
};

const getTrafficColor = (density) => {
  if (density > 8000) return '#dc2626'; // Very high
  if (density > 4000) return '#ea580c'; // High
  if (density > 2000) return '#d97706'; // Medium
  return '#16a34a'; // Low
};

const MapUpdater = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location && location.lat && location.lng) {
      map.setView([location.lat, location.lng], 12);
    }
  }, [location, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapView = ({ activeLayers, onMarkerClick, selectedMarkerId, onRequireSurvey }) => {
  const { location, setLocation } = useLocation();
  const [mapMarkers, setMapMarkers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchMarkers = async () => {
      try {
        const res = location
          ? await getMapMarkers(location.city, location.lat, location.lng, location.dataSource, location.baselineCo2 || undefined)
          : await getMapMarkers();
        if (!cancelled) setMapMarkers(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Failed to load map markers', err);
        if (!cancelled) setMapMarkers([]);
      }
    };
    fetchMarkers();
    return () => { cancelled = true; };
  }, [location]);

  const handleMapClick = async (lat, lng) => {
    try {
      const geo = await reverseGeocode(lat, lng);
      const address = geo?.address || {};
      const city = address.city || address.town || address.village
        || address.suburb || address.county || 'Selected Area';
      const state = address.state || '';
      const details = await getLocationDetails(city, lat, lng, state);
      if (details && details.status === 'READY') {
        setLocation(details);
      } else {
        onRequireSurvey({ city, state, lat, lng, weather: details ? details.weather : null });
      }
    } catch (e) {
      console.error('Map click error', e);
    }
  };

  return (
    <MapContainer id="map"
      center={location ? [location.lat, location.lng] : MAP_CONFIG.defaultCenter}
      zoom={location ? 12 : MAP_CONFIG.defaultZoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg z-0"
    >
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.attribution}
      />
      <MapUpdater location={location} />
      <MapClickHandler onMapClick={handleMapClick} />
      
      {activeLayers.co2 && mapMarkers.map(marker => {
  const isSelected = marker.id === selectedMarkerId;
  const radius = Math.min(30, Math.max(8, (marker.co2 / 1000) * 8));
  return (
    <CircleMarker
      key={marker.id}
      center={[marker.lat, marker.lng]}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        color: getRiskColor(marker.risk),
        fillColor: getRiskColor(marker.risk),
        fillOpacity: 0.6,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{ click: () => onMarkerClick(marker) }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-semibold text-slate-900">{marker.area}</h3>
          <div className="text-sm text-slate-600 mt-1">
            <div>Modelled area CO₂: {(marker.co2 / 1000).toFixed(2)} tonnes/day</div>
            <div>Risk: <span style={{ color: getRiskColor(marker.risk) }} className="font-medium">{marker.risk}</span></div>
            <div className="text-xs text-slate-400 mt-1">{location ? location.dataSource : 'Sample'}</div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
})}

{activeLayers.traffic && mapMarkers.map(marker => {
  const isSelected = marker.id === selectedMarkerId;
  const traffic = marker.traffic_density_km2 || 0;
  const radius = Math.min(30, Math.max(8, (traffic / 1000) * 5));
  const colour = getTrafficColor(traffic);
  return (
    <CircleMarker
      key={marker.id}
      center={[marker.lat, marker.lng]}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        color: colour,
        fillColor: colour,
        fillOpacity: 0.6,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{ click: () => onMarkerClick(marker) }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-semibold text-slate-900">{marker.area}</h3>
          <div className="text-sm text-slate-600 mt-1">Vehicle density: {traffic} vehicles/km²</div>
        </div>
      </Popup>
    </CircleMarker>
  );
})}

{activeLayers.hotspots && mapMarkers.filter(m => m.isHotspot || m.isModelEstimated === true).map(marker => {
  const isSelected = marker.id === selectedMarkerId;
  const radius = 10;
  const colour = marker.isModelEstimated ? '#6b7280' : '#0ea5e9';
  const label = marker.isModelEstimated ? 'Model‑estimated zone' : 'Hotspot';
  return (
    <CircleMarker
      key={marker.id}
      center={[marker.lat, marker.lng]}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        color: colour,
        fillColor: colour,
        fillOpacity: 0.5,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{ click: () => onMarkerClick(marker) }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-semibold text-slate-900">{marker.area}</h3>
          <div className="text-sm text-slate-600 mt-1">{label}</div>
        </div>
      </Popup>
    </CircleMarker>
  );
})}

{activeLayers.capture && mapMarkers.filter(m => m.isCaptureLocation).map(marker => {
  const isSelected = marker.id === selectedMarkerId;
  return (
    <CircleMarker
      key={marker.id}
      center={[marker.lat, marker.lng]}
      radius={12}
      pathOptions={{
        color: '#7c3aed',
        fillColor: '#7c3aed',
        fillOpacity: 0.4,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{ click: () => onMarkerClick(marker) }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-semibold text-slate-900">{marker.area}</h3>
          <div className="text-sm text-slate-600 mt-1">Capture location</div>
        </div>
      </Popup>
    </CircleMarker>
  );
})}

    </MapContainer>
  );
};

export default MapView;
