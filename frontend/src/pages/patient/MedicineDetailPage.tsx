import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import type { StockStatus } from '../../types';
import { FiChevronLeft, FiMap, FiPhone, FiInfo } from 'react-icons/fi';
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

  const { data: medicine, isLoading, isError } = useQuery({
    queryKey: ['medicine', id, lat, lng],
    queryFn: () => medicinesApi.getById(id!, lat, lng),
    enabled: !!id,
  });

  const getDirections = (pharmacyName: string, address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pharmacyName} ${address} Zimbabwe`)}`;
    window.open(url, '_blank');
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

  const available = medicine.availability.filter((a) => a.stockStatus !== 'out_of_stock');
  const outOfStock = medicine.availability.filter((a) => a.stockStatus === 'out_of_stock');

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back"><FiChevronLeft /></button>
        <h1 className="app-header-title">{medicine.genericName}</h1>
        <button
          className="btn-icon"
          onClick={() => navigate(`/map${lat ? `?lat=${lat}&lng=${lng}` : ''}`)}
          aria-label="View on map"
        ><FiMap /></button>
      </header>

      {/* Hero */}
      <div className="medicine-detail-hero" style={{ flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {medicine.imageUrl ? (
          <img src={medicine.imageUrl} alt={medicine.genericName} style={{ width: 120, height: 120, borderRadius: 20, objectFit: 'cover', background: '#f5f5f5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
        ) : (
          <div className="medicine-detail-hero-icon" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPills size={40} /></div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div className="medicine-detail-name">
            {medicine.genericName} {medicine.dosage && <span style={{ fontSize: 16, color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{medicine.dosage}</span>}
          </div>
          <div className="medicine-detail-meta" style={{ justifyContent: 'center', marginTop: 4 }}>
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
            <div key={avail.pharmacyId} className="pharmacy-availability-card">
              <div className="pharmacy-avail-name">{avail.pharmacyName}</div>
              <div className="pharmacy-avail-address">{avail.address}{avail.suburb ? `, ${avail.suburb}` : ''}</div>
              <div className="pharmacy-avail-row">
                <Badge status={avail.stockStatus as StockStatus} />
                {avail.distance != null && (
                  <span className="distance-chip"><FaMapMarkerAlt /> {formatDistance(avail.distance)}</span>
                )}
                {avail.price != null && (
                  <span className="medicine-price">${avail.price.toFixed(2)}</span>
                )}
              </div>
              <div className="last-updated">Updated {timeAgo(avail.lastUpdated)}</div>
              <div className="pharmacy-avail-actions">
                {avail.phone && (
                  <a href={`tel:${avail.phone}`} className="btn-outline-sm"><FiPhone /> Call</a>
                )}
                <button className="btn-outline-sm" onClick={() => getDirections(avail.pharmacyName, avail.address)}>
                  <FaMapMarkerAlt /> Directions
                </button>
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
