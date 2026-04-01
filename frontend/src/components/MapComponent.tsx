import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pharmacy, StockStatus } from '../types';

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getPharmacyIcon = (status?: StockStatus) => {
  let color = '#028090'; // Default MediFind teal
  let emoji = '🏥';

  if (status === 'in_stock') {
    color = '#10B981'; // Green
    emoji = '✅';
  } else if (status === 'low_stock') {
    color = '#F59E0B'; // Amber
    emoji = '⚠️';
  } else if (status === 'out_of_stock') {
    color = '#EF4444'; // Red
    emoji = '❌';
  }

  return L.divIcon({
    html: `<div style="
      background: ${color};
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      border: 2px solid white;
      transition: all 0.3s ease;
    ">${emoji}</div>`,
    className: 'pharmacy-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const userIcon = L.divIcon({
  html: `<div style="
    background: #2563EB;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
    animation: pulse 1.5s ease-in-out infinite;
  "></div>`,
  className: 'user-marker-pulse',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface MapComponentProps {
  center: [number, number];
  pharmacies: Pharmacy[];
  userCoords: [number, number];
  onPharmacyClick: (pharmacy: Pharmacy) => void;
}

export default function MapComponent({ center, pharmacies, userCoords, onPharmacyClick }: MapComponentProps) {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={13}
        className="leaflet-container"
        style={{ height: 'calc(100dvh - 120px)' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />

        {/* User location */}
        <Marker position={userCoords} icon={userIcon}>
          <Popup>📍 Your location</Popup>
        </Marker>

        {/* Pharmacy markers */}
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            position={[pharmacy.latitude, pharmacy.longitude]}
            icon={getPharmacyIcon((pharmacy as any).stockStatus)}
            eventHandlers={{ click: () => onPharmacyClick(pharmacy) }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{pharmacy.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{pharmacy.address}</div>
                {pharmacy.phone && (
                  <a href={`tel:${pharmacy.phone}`} style={{ fontSize: 12, color: '#028090', display: 'block', marginTop: 6 }}>
                    📞 {pharmacy.phone}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
