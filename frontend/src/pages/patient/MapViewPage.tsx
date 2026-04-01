import { useState, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pharmaciesApi } from '../../api/pharmacies';
import { useGeolocation } from '../../hooks/useGeolocation';
import Badge from '../../components/ui/Badge';
import type { Pharmacy, StockStatus } from '../../types';
import { FiChevronLeft, FiMap, FiList, FiPhone } from 'react-icons/fi';
import { FaClinicMedical, FaMapMarkerAlt } from 'react-icons/fa';

// Lazy-load Leaflet only when map is rendered (saves ~400KB for users who don't need it)
const MapComponent = lazy(() => import('../../components/MapComponent'));

export default function MapViewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { coords } = useGeolocation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showMap, setShowMap] = useState(false);

  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const lat = coords?.lat ?? (urlLat ? parseFloat(urlLat) : -17.8292);
  const lng = coords?.lng ?? (urlLng ? parseFloat(urlLng) : 31.0522);

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['pharmacies', lat, lng],
    queryFn: () => pharmaciesApi.getNearby(lat, lng, 15),
    staleTime: 15 * 60 * 1000,
  });

  const getDirections = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back"><FiChevronLeft /></button>
        <h1 className="app-header-title">Pharmacy Map</h1>
        <button
          className="btn-icon"
          onClick={() => setShowMap(!showMap)}
          title={showMap ? 'List view' : 'Map view'}
        >
          {showMap ? <FiList /> : <FiMap />}
        </button>
      </header>

      {!showMap ? (
        /* List view (default - cheaper data) */
        <div className="page-content">
          <p className="results-count">
            <strong>{pharmacies.length}</strong> pharmacies within 15km
          </p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: 16 }}
            onClick={() => setShowMap(true)}
          >
            <FiMap /> View on Map
          </button>

          {isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon"><FaClinicMedical /></div>
              <p style={{ color: 'var(--color-text-secondary)' }}>Finding pharmacies...</p>
            </div>
          )}

          <div className="results-list">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="medicine-card"
                onClick={() => setSelectedPharmacy(pharmacy)}
                role="button"
                tabIndex={0}
              >
                <div className="medicine-card-header">
                  <div className="medicine-icon"><FaClinicMedical color="var(--color-primary)" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="medicine-name">{pharmacy.name}</div>
                    <div className="medicine-meta">{pharmacy.address}</div>
                    {pharmacy.suburb && <div className="medicine-meta">{pharmacy.suburb}, {pharmacy.city}</div>}
                  </div>
                </div>
                <div className="card-status-row">
                  {pharmacy.distance != null && (
                    <span className="distance-chip"><FaMapMarkerAlt /> {pharmacy.distance! < 1 ? `${Math.round(pharmacy.distance! * 1000)}m` : `${pharmacy.distance!.toFixed(1)}km`}</span>
                  )}
                  {pharmacy.phone && <span className="distance-chip"><FiPhone /> {pharmacy.phone}</span>}
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  {pharmacy.phone && (
                    <a href={`tel:${pharmacy.phone}`} className="btn-outline-sm"><FiPhone /> Call</a>
                  )}
                  <button className="btn-outline-sm" onClick={() => getDirections(pharmacy)}>
                    <FaMapMarkerAlt /> Directions
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pharmacies.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon"><FaClinicMedical /></div>
              <div className="empty-state-title">No pharmacies nearby</div>
              <div className="empty-state-text">Enable location or try expanding the search radius</div>
            </div>
          )}
        </div>
      ) : (
        /* Map view - loaded lazily */
        <div className="page-content-full">
          <Suspense fallback={
            <div className="empty-state"><div className="empty-state-icon"><FiMap /></div><p>Loading map...</p></div>
          }>
            <MapComponent
              center={[lat, lng]}
              pharmacies={pharmacies}
              userCoords={[lat, lng]}
              onPharmacyClick={(p) => setSelectedPharmacy(p)}
            />
          </Suspense>

          {/* Bottom sheet for selected pharmacy */}
          {selectedPharmacy && (
            <div className="modal-overlay" onClick={() => setSelectedPharmacy(null)}>
              <div className="map-bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="map-sheet-handle" />
                <button className="map-sheet-close" onClick={() => setSelectedPharmacy(null)}>✕</button>
                <div className="map-pharmacy-name">{selectedPharmacy.name}</div>
                <div className="map-pharmacy-address">{selectedPharmacy.address}</div>
                {selectedPharmacy.distance != null && (
                  <span className="distance-chip" style={{ marginTop: 6 }}>
                    <FaMapMarkerAlt /> {selectedPharmacy.distance < 1 ? `${Math.round(selectedPharmacy.distance * 1000)}m` : `${selectedPharmacy.distance.toFixed(1)}km`}
                  </span>
                )}
                <div className="map-actions">
                  {selectedPharmacy.phone && (
                    <a href={`tel:${selectedPharmacy.phone}`} className="btn btn-secondary btn-sm"><FiPhone /> Call</a>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => getDirections(selectedPharmacy)}>
                    <FaMapMarkerAlt /> Directions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
