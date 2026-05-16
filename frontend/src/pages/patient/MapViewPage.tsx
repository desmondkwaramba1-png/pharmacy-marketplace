import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pharmaciesApi } from '../../api/pharmacies';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';
import type { Pharmacy } from '../../types';
import { FiChevronLeft, FiMap, FiList, FiPhone, FiSearch, FiX } from 'react-icons/fi';
import { FaClinicMedical, FaMapMarkerAlt } from 'react-icons/fa';

// Lazy-load Leaflet only when map is rendered (saves ~400KB for users who don't need it)
const MapComponent = lazy(() => import('../../components/MapComponent'));

export default function MapViewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { coords } = useGeolocation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const destLat = searchParams.get('destLat');
  const destLng = searchParams.get('destLng');

  const lat = coords?.lat ?? (urlLat ? parseFloat(urlLat) : -17.8292);
  const lng = coords?.lng ?? (urlLng ? parseFloat(urlLng) : 31.0522);

  // Automatically switch to map if destination provided
  useEffect(() => {
    if (destLat && destLng) {
      setShowMap(true);
    }
  }, [destLat, destLng]);

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['pharmacies', lat, lng],
    queryFn: () => pharmaciesApi.getNearby(lat, lng, 15),
    staleTime: 15 * 60 * 1000,
  });

  const { data: routeData } = useQuery({
    queryKey: ['route', lng, lat, destLng, destLat],
    queryFn: async () => {
      if (!destLat || !destLng || !lng || !lat) return null;
      const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 'Ok' || !json.routes.length) return null;
      const route = json.routes[0];
      const coordinates = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      const steps = route.legs[0].steps.map((s: any) => ({
        instruction: s.maneuver.instruction,
        distance: s.distance,
        name: s.name
      }));
      return { coordinates, steps, distance: route.distance, duration: route.duration };
    },
    enabled: !!destLat && !!destLng && !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });

  const getDirections = (pharmacy: Pharmacy) => {
    navigate(`/map?destLat=${pharmacy.latitude}&destLng=${pharmacy.longitude}&name=${encodeURIComponent(pharmacy.name)}`);
    setShowMap(true);
    setSelectedPharmacy(null);
  };

  // Filter pharmacies by search input
  const filteredPharmacies = debouncedSearch
    ? pharmacies.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.address.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.suburb || '').toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : pharmacies;

  return (
    <div className="page">
      <style>{`
        .mvp-pharmacy-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(2,132,168,0.15) !important; }
      `}</style>

      {/* Glassmorphism header */}
      <header style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #eef2f7',
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 }}
        >
          <FiChevronLeft size={20} />
        </button>
        {!showMap && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 12, padding: '0 12px', height: 40, gap: 8, border: '1.5px solid #e2e8f0' }}>
            <FiSearch color="#0284a8" size={16} />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search pharmacies..."
              autoComplete="off"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a' }}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}>
                <FiX size={15} />
              </button>
            )}
          </div>
        )}
        {showMap && (
          <h1 style={{ flex: 1, color: '#0f172a', fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            {destLat ? 'Navigation' : 'Pharmacy Map'}
          </h1>
        )}
        <button
          onClick={() => setShowMap(!showMap)}
          title={showMap ? 'List view' : 'Map view'}
          style={{ background: showMap ? 'linear-gradient(135deg, #0284a8, #02C39A)' : '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showMap ? '#fff' : '#475569', flexShrink: 0, boxShadow: showMap ? '0 2px 8px rgba(2,132,168,0.3)' : 'none' }}
        >
          {showMap ? <FiList size={18} /> : <FiMap size={18} />}
        </button>
      </header>

      {!showMap ? (
        /* List view */
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              <strong style={{ color: '#0f172a' }}>{filteredPharmacies.length}</strong> {debouncedSearch ? 'matching' : ''} pharmacies within 15km
            </p>
            <button
              style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(2,132,168,0.3)' }}
              onClick={() => setShowMap(true)}
            >
              <FiMap size={14} /> Map
            </button>
          </div>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <FaClinicMedical size={36} color="#cbd5e1" />
              <p style={{ color: '#64748b', marginTop: 12, fontWeight: 500 }}>Finding pharmacies...</p>
            </div>
          )}

          <div>
            {filteredPharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="mvp-pharmacy-card"
                onClick={() => setSelectedPharmacy(pharmacy)}
                role="button"
                tabIndex={0}
                style={{
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  borderLeft: '4px solid #0284a8',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  padding: 16,
                  marginBottom: 12,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #e0f2fe, #ccfbf1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaClinicMedical color="#0284a8" size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{pharmacy.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{pharmacy.address}</div>
                    {pharmacy.suburb && <div style={{ fontSize: 12, color: '#64748b' }}>{pharmacy.suburb}, {pharmacy.city}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {pharmacy.distance != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#e0f2fe', color: '#0284a8' }}>
                      <FaMapMarkerAlt size={10} /> {pharmacy.distance < 1 ? `${Math.round(pharmacy.distance * 1000)}m` : `${pharmacy.distance.toFixed(1)}km`}
                    </span>
                  )}
                  {pharmacy.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f0fdf4', color: '#059669' }}>
                      <FiPhone size={10} /> {pharmacy.phone}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  {pharmacy.phone && (
                    <a href={`tel:${pharmacy.phone}`} style={{ flex: 1, background: '#f8fafc', color: '#0284a8', border: '1.5px solid #0284a8', borderRadius: 10, padding: '9px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                      <FiPhone size={14} /> Call
                    </a>
                  )}
                  <button
                    style={{ flex: 1, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(2,132,168,0.3)' }}
                    onClick={() => getDirections(pharmacy)}
                  >
                    <FaMapMarkerAlt size={13} /> Directions
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPharmacies.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <FaClinicMedical size={40} color="#cbd5e1" />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b', marginTop: 12 }}>
                {debouncedSearch ? 'No matching pharmacies' : 'No pharmacies nearby'}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                {debouncedSearch ? 'Try a different search term' : 'Enable location or try expanding the search radius'}
              </div>
            </div>
          )}

          {/* Selected pharmacy bottom sheet (list view) */}
          {selectedPharmacy && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
              onClick={() => setSelectedPharmacy(null)}
            >
              <div
                style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '20px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 16px' }} />
                <button onClick={() => setSelectedPharmacy(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', fontSize: 14, fontWeight: 700 }}>✕</button>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaClinicMedical color="#fff" size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{selectedPharmacy.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{selectedPharmacy.address}</div>
                  </div>
                </div>
                {selectedPharmacy.distance != null && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: '#e0f2fe', color: '#0284a8', marginBottom: 16 }}>
                    <FaMapMarkerAlt size={11} /> {selectedPharmacy.distance < 1 ? `${Math.round(selectedPharmacy.distance * 1000)}m` : `${selectedPharmacy.distance.toFixed(1)}km`}
                  </span>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  {selectedPharmacy.phone && (
                    <a href={`tel:${selectedPharmacy.phone}`} style={{ flex: 1, background: '#f8fafc', color: '#0284a8', border: '1.5px solid #0284a8', borderRadius: 12, padding: '11px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                      <FiPhone size={15} /> Call
                    </a>
                  )}
                  <button
                    style={{ flex: 1, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(2,132,168,0.35)' }}
                    onClick={() => getDirections(selectedPharmacy)}
                  >
                    <FaMapMarkerAlt size={14} /> Directions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Map view */
        <div className="page-content-full" style={{ position: 'relative' }}>
          <Suspense fallback={
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <FiMap size={40} color="#0284a8" />
              <p style={{ color: '#64748b', marginTop: 12 }}>Loading map...</p>
            </div>
          }>
            <MapComponent
              center={destLat && destLng ? [parseFloat(destLat), parseFloat(destLng)] : [lat, lng]}
              pharmacies={pharmacies}
              userCoords={[lat, lng]}
              onPharmacyClick={(p) => setSelectedPharmacy(p)}
              routePositions={routeData?.coordinates || undefined}
              bounds={destLat && destLng ? [[lat, lng], [parseFloat(destLat), parseFloat(destLng)]] : undefined}
            />
          </Suspense>

          {/* In-app Directions Panel */}
          {routeData && destLat && (
            <div className="directions-panel">
              <div className="directions-header">
                <div style={{ fontWeight: 700 }}>Directions to {searchParams.get('name') || 'Pharmacy'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {(routeData.distance / 1000).toFixed(1)} km · {Math.round(routeData.duration / 60)} min
                </div>
              </div>
              <div className="directions-steps">
                {routeData.steps.map((s: any, i: number) => (
                  <div key={i} className="direction-step">
                    <span className="step-bullet">{i + 1}</span>
                    <div className="step-content">
                      <div className="step-text">{s.instruction}</div>
                      {s.distance > 0 && (
                        <div className="step-distance">Next {s.distance < 1000 ? `${Math.round(s.distance)}m` : `${(s.distance / 1000).toFixed(1)}km`}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom sheet for selected pharmacy (map view) */}
          {selectedPharmacy && !destLat && (
            <div className="modal-overlay" onClick={() => setSelectedPharmacy(null)}>
              <div className="map-bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="map-sheet-handle" />
                <button className="map-sheet-close" onClick={() => setSelectedPharmacy(null)}>✕</button>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaClinicMedical color="#fff" size={18} />
                  </div>
                  <div>
                    <div className="map-pharmacy-name">{selectedPharmacy.name}</div>
                    <div className="map-pharmacy-address">{selectedPharmacy.address}</div>
                  </div>
                </div>
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
