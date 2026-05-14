import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { StockStatus } from '../../types';
import { FiChevronLeft, FiMap, FiPhone, FiInfo, FiShoppingCart, FiLogIn } from 'react-icons/fi';
import { FaPills, FaMapMarkerAlt, FaClinicMedical } from 'react-icons/fa';

function formatDistance(km: number | null | undefined): string {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { coords } = useGeolocation();

  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const lat = coords?.lat ?? (urlLat ? parseFloat(urlLat) : null);
  const lng = coords?.lng ?? (urlLng ? parseFloat(urlLng) : null);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: medicine, isLoading, isError } = useQuery({
    queryKey: ['medicine', id, lat, lng],
    queryFn: () => medicinesApi.getById(id!, lat, lng),
    enabled: !!id,
  });

  const getDirections = (pharmacyName: string, address: string, lat?: number, lng?: number) => {
    // We now guarantee coordinates via SQL, so we can always stay in-app
    if (lat && lng) {
      navigate(`/map?destLat=${lat}&destLng=${lng}&name=${encodeURIComponent(pharmacyName)}`);
    } else {
      // Fallback just in case, but using the in-app search
      navigate(`/map?q=${encodeURIComponent(pharmacyName)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
          <h1 className="app-header-title">Medicine Details</h1>
        </header>
        <div className="page-content"><SkeletonList count={3} /></div>
      </div>
    );
  }

  if (isError || !medicine) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
          <h1 className="app-header-title">Not Found</h1>
        </header>
        <div className="empty-state">
          <div className="empty-state-icon"><FaPills /></div>
          <div className="empty-state-title">Medicine not found</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const requiresRx = medicine.requiresPrescription || medicine.distributionCategory === 'PP';
  const isBanned   = medicine.isBanned;

  const available = medicine.availability.filter((a) => a.stockStatus !== 'out_of_stock');
  const outOfStock = medicine.availability.filter((a) => a.stockStatus === 'out_of_stock');

  return (
    <div className="page" style={{ animation: 'mdp-fadeIn 0.4s ease both' }}>
      <style>{`
        @keyframes mdp-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <header style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #eef2f7',
      }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 }}>
          <FiChevronLeft size={20} />
        </button>
        <h1 style={{ flex: 1, color: '#0f172a', fontSize: 16, fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{medicine.genericName}</h1>
        <button onClick={() => navigate(`/map${lat ? `?lat=${lat}&lng=${lng}` : ''}`)} aria-label="View on map" style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0284a8', flexShrink: 0 }}>
          <FiMap size={18} />
        </button>
      </header>

      {/* MCAZ compliance banners */}
      {isBanned && (
        <div style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px 16px', margin: '0 16px 8px', borderRadius: 8 }}>
          <strong style={{ color: '#dc2626' }}>⚠️ Banned / Withdrawn</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7f1d1d' }}>
            This product has been withdrawn from the MCAZ register and cannot be dispensed.
          </p>
        </div>
      )}
      {!isBanned && requiresRx && (
        <div style={{ background: '#fef3c7', borderLeft: '4px solid #d97706', padding: '12px 16px', margin: '0 16px 8px', borderRadius: 8 }}>
          <strong style={{ color: '#92400e' }}>🔒 Prescription Required (PP)</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#78350f' }}>
            This is a Prescription Preparation medicine regulated by MCAZ. A valid prescription must be uploaded at checkout and verified by the dispensing pharmacist.
          </p>
        </div>
      )}
      {!isBanned && medicine.distributionCategory === 'PIM' && (
        <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px 16px', margin: '0 16px 8px', borderRadius: 8 }}>
          <strong style={{ color: '#1e40af' }}>ℹ️ Pharmacist Initiative Medicine (PIM)</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1e3a8a' }}>
            This medicine should be dispensed under pharmacist guidance.
          </p>
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)', padding: '32px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 65%)', top: -100, left: -80, pointerEvents: 'none' }} />
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(2,132,168,0.2)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {medicine.imageUrl ? (
            <img src={medicine.imageUrl} alt={medicine.genericName} style={{ width: 88, height: 88, objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
          ) : (
            <FaPills size={42} color="#0284a8" />
          )}
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            {medicine.genericName} {medicine.dosage && <span style={{ fontSize: 15, fontWeight: 500, color: '#475569' }}>{medicine.dosage}</span>}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {[medicine.form, medicine.brandName, medicine.category].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Info */}
        <div className="info-section">
          <div className="info-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiInfo /> About
          </div>
          {medicine.description && (
            <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 10 }}>
              {medicine.description}
            </p>
          )}
          <div className="info-grid">
            {medicine.category && (
              <div>
                <div className="info-item-label">Category</div>
                <div className="info-item-value">{medicine.category}</div>
              </div>
            )}
            {medicine.form && (
              <div>
                <div className="info-item-label">Form</div>
                <div className="info-item-value" style={{ textTransform: 'capitalize' }}>{medicine.form}</div>
              </div>
            )}
            {medicine.dosage && (
              <div>
                <div className="info-item-label">Dosage</div>
                <div className="info-item-value">{medicine.dosage}</div>
              </div>
            )}
            {medicine.standardPrice && (
              <div>
                <div className="info-item-label">Reference Price</div>
                <div className="info-item-value">${medicine.standardPrice.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="info-section" style={{ marginTop: 12 }}>
          <div className="info-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaMapMarkerAlt /> Available at {medicine.availability.length} {medicine.availability.length === 1 ? 'pharmacy' : 'pharmacies'}
          </div>

          {medicine.availability.length === 0 && (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon" style={{ fontSize: 36 }}><FaClinicMedical /></div>
              <div className="empty-state-title" style={{ fontSize: 15 }}>Not listed at any pharmacy</div>
            </div>
          )}

          {/* In stock / low stock first */}
          {available.map((avail) => (
            <div key={avail.pharmacyId} className="pharmacy-availability-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderLeft: '3px solid #0284a8', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(2,132,168,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              <div className="pharmacy-avail-name">{avail.pharmacyName}</div>
              <div className="pharmacy-avail-address">{avail.address}{avail.suburb ? `, ${avail.suburb}` : ''}</div>
              <div className="pharmacy-avail-row">
                <Badge status={avail.stockStatus as StockStatus} />
                {avail.distance != null && (
                  <span className="distance-chip"><FaMapMarkerAlt /> {formatDistance(avail.distance)}</span>
                )}
                {avail.price != null && (
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0284a8', letterSpacing: '-0.02em' }}>${avail.price.toFixed(2)}</span>
                )}
              </div>
              <div className="last-updated">Updated {timeAgo(avail.lastUpdated)}</div>
              <div className="pharmacy-avail-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {isBanned ? (
                  <button className="btn btn-sm" disabled style={{ flex: 1, minWidth: '120px', opacity: 0.5, cursor: 'not-allowed', background: '#dc2626', color: '#fff' }}>
                    ⚠️ Unavailable
                  </button>
                ) : !isAuthenticated ? (
                  <button
                    style={{ flex: 1, minWidth: '120px', background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                    }}
                  >
                    <FiLogIn size={15} /> Sign In to Reserve
                  </button>
                ) : requiresRx ? (
                  <button
                    style={{ flex: 1, minWidth: '120px', background: 'linear-gradient(135deg, #D97706, #f59e0b)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(avail.pharmacyId, medicine.id);
                    }}
                  >
                    🔒 Reserve (Rx required)
                  </button>
                ) : (
                  <button
                    style={{ flex: 1, minWidth: '120px', background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(avail.pharmacyId, medicine.id);
                    }}
                  >
                    <FiShoppingCart size={15} /> Add to Cart
                  </button>
                )}
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  {avail.phone && (
                    <a href={`tel:${avail.phone}`} className="btn-outline-sm" style={{ flex: 1, justifyContent: 'center' }}><FiPhone /> Call</a>
                  )}
                  <button className="btn-outline-sm" style={{ flex: 1 }} onClick={() => getDirections(avail.pharmacyName, avail.address, avail.latitude, avail.longitude)}>
                    <FaMapMarkerAlt /> Directions
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Out of stock */}
          {outOfStock.length > 0 && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)', padding: '8px 0' }}>
                {outOfStock.length} pharmacy out of stock
              </summary>
              {outOfStock.map((avail) => (
                <div key={avail.pharmacyId} className="pharmacy-availability-card" style={{ opacity: 0.7, marginTop: 8 }}>
                  <div className="pharmacy-avail-name">{avail.pharmacyName}</div>
                  <div className="pharmacy-avail-address">{avail.address}</div>
                  <div className="pharmacy-avail-row">
                    <Badge status="out_of_stock" />
                    {avail.distance != null && (
                      <span className="distance-chip"><FaMapMarkerAlt /> {formatDistance(avail.distance)}</span>
                    )}
                  </div>
                  <div className="last-updated">Updated {timeAgo(avail.lastUpdated)}</div>
                </div>
              ))}
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
