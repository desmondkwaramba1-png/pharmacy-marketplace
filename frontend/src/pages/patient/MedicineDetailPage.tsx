import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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

function StockBadge({ status }: { status: string }) {
  if (status === 'in_stock') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#d1fae5', color: '#059669' }}>✓ In Stock</span>;
  }
  if (status === 'low_stock') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fef3c7', color: '#D97706' }}>⚠ Low Stock</span>;
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fee2e2', color: '#dc2626' }}>✕ Out of Stock</span>;
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

  const getDirections = (pharmacyName: string, address: string, pLat?: number, pLng?: number) => {
    if (pLat && pLng) {
      navigate(`/map?destLat=${pLat}&destLng=${pLng}&name=${encodeURIComponent(pharmacyName)}`);
    } else {
      navigate(`/map?q=${encodeURIComponent(pharmacyName + ' ' + address)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', borderBottom: '1px solid #eef2f7' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}><FiChevronLeft size={20} /></button>
          <h1 style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Medicine Details</h1>
        </header>
        <div className="page-content"><SkeletonList count={3} /></div>
      </div>
    );
  }

  if (isError || !medicine) {
    return (
      <div className="page">
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', borderBottom: '1px solid #eef2f7' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}><FiChevronLeft size={20} /></button>
          <h1 style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Not Found</h1>
        </header>
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💊</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Medicine not found</div>
          <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.35)' }}>Go Home</button>
        </div>
      </div>
    );
  }

  const requiresRx = medicine.requiresPrescription || medicine.distributionCategory === 'PP';
  const isBanned   = medicine.isBanned;

  const available  = medicine.availability.filter((a) => a.stockStatus !== 'out_of_stock');
  const outOfStock = medicine.availability.filter((a) => a.stockStatus === 'out_of_stock');

  return (
    <div className="page" style={{ animation: 'mdp-fadeIn 0.4s ease both' }}>
      <style>{`
        @keyframes mdp-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .mdp-avail-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .mdp-avail-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(2,132,168,0.15) !important; }
      `}</style>

      {/* Glassmorphism sticky header */}
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
        <div style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px 16px', margin: '12px 16px 0', borderRadius: 10 }}>
          <strong style={{ color: '#dc2626', fontSize: 14 }}>⚠️ Banned / Withdrawn</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
            This product has been withdrawn from the MCAZ register and cannot be dispensed.
          </p>
        </div>
      )}
      {!isBanned && requiresRx && (
        <div style={{ background: '#fef3c7', borderLeft: '4px solid #d97706', padding: '12px 16px', margin: '12px 16px 0', borderRadius: 10 }}>
          <strong style={{ color: '#92400e', fontSize: 14 }}>🔒 Prescription Required (PP)</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
            This is a Prescription Preparation medicine regulated by MCAZ. A valid prescription must be uploaded at checkout and verified by the dispensing pharmacist.
          </p>
        </div>
      )}
      {!isBanned && medicine.distributionCategory === 'PIM' && (
        <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px 16px', margin: '12px 16px 0', borderRadius: 10 }}>
          <strong style={{ color: '#1e40af', fontSize: 14 }}>ℹ️ Pharmacist Initiative Medicine (PIM)</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1e3a8a', lineHeight: 1.5 }}>
            This medicine should be dispensed under pharmacist guidance.
          </p>
        </div>
      )}

      {/* Teal gradient hero */}
      <div style={{ background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)', padding: '32px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 65%)', top: -100, left: -80, pointerEvents: 'none' }} />
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(2,132,168,0.2)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {medicine.imageUrl ? (
            <img src={medicine.imageUrl} alt={medicine.genericName} style={{ width: 88, height: 88, objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <FaPills size={42} color="#0284a8" />
          )}
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            {medicine.genericName}{medicine.dosage && <span style={{ fontSize: 15, fontWeight: 500, color: '#475569', marginLeft: 6 }}>{medicine.dosage}</span>}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            {[medicine.form, medicine.brandName, medicine.category].filter(Boolean).join(' · ')}
          </div>
          {medicine.distributionCategory && (
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(2,132,168,0.12)', color: '#0284a8' }}>
              {medicine.distributionCategory}
            </span>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* About section */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            <FiInfo size={16} color="#0284a8" /> About
          </div>
          {medicine.description && (
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, marginBottom: 14 }}>{medicine.description}</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {medicine.category && (
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Category</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{medicine.category}</div>
              </div>
            )}
            {medicine.form && (
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Form</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{medicine.form}</div>
              </div>
            )}
            {medicine.dosage && (
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Dosage</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{medicine.dosage}</div>
              </div>
            )}
            {medicine.standardPrice != null && (
              <div style={{ background: 'linear-gradient(135deg, #e0f4f8, #b3e5f0)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#0284a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Reference Price</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0284a8' }}>${medicine.standardPrice.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Availability section */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            <FaMapMarkerAlt size={14} color="#0284a8" />
            Available at {medicine.availability.length} {medicine.availability.length === 1 ? 'pharmacy' : 'pharmacies'}
          </div>

          {medicine.availability.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <FaClinicMedical size={36} color="#cbd5e1" />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#64748b', marginTop: 10 }}>Not listed at any pharmacy</div>
            </div>
          )}

          {/* In stock / low stock first */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {available.map((avail) => (
              <div
                key={avail.pharmacyId}
                className="mdp-avail-card"
                style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderLeft: '4px solid #0284a8', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{avail.pharmacyName}</div>
                  {avail.price != null && (
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0284a8', letterSpacing: '-0.02em', flexShrink: 0, marginLeft: 8 }}>${Number(avail.price).toFixed(2)}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{avail.address}{avail.suburb ? `, ${avail.suburb}` : ''}</div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                  <StockBadge status={avail.stockStatus} />
                  {avail.distance != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#e0f2fe', color: '#0284a8' }}>
                      <FaMapMarkerAlt size={10} /> {formatDistance(avail.distance)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Updated {timeAgo(avail.lastUpdated)}</div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {isBanned ? (
                    <button style={{ flex: 1, minWidth: 120, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} disabled>
                      ⚠️ Unavailable
                    </button>
                  ) : !isAuthenticated ? (
                    <button
                      style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                    >
                      <FiLogIn size={15} /> Sign In to Reserve
                    </button>
                  ) : requiresRx ? (
                    <button
                      style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg, #D97706, #f59e0b)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => addToCart(avail.pharmacyId, medicine.id)}
                    >
                      🔒 Reserve (Rx required)
                    </button>
                  ) : (
                    <button
                      style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => addToCart(avail.pharmacyId, medicine.id)}
                    >
                      <FiShoppingCart size={15} /> Add to Cart
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                    {avail.phone && (
                      <a href={`tel:${avail.phone}`} style={{ flex: 1, minWidth: 80, background: '#f8fafc', color: '#0284a8', border: '1.5px solid #0284a8', borderRadius: 10, padding: '10px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                        <FiPhone size={14} /> Call
                      </a>
                    )}
                    <button
                      style={{ flex: 1, minWidth: 80, background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => getDirections(avail.pharmacyName, avail.address, avail.latitude, avail.longitude)}
                    >
                      <FaMapMarkerAlt size={13} /> Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Out of stock pharmacies */}
          {outOfStock.length > 0 && (
            <details style={{ marginTop: 14 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 600, padding: '8px 0', userSelect: 'none' }}>
                {outOfStock.length} {outOfStock.length === 1 ? 'pharmacy' : 'pharmacies'} out of stock
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {outOfStock.map((avail) => (
                  <div
                    key={avail.pharmacyId}
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderLeft: '4px solid #dc2626', borderRadius: 14, padding: '12px 14px', opacity: 0.75 }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{avail.pharmacyName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{avail.address}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <StockBadge status="out_of_stock" />
                      {avail.distance != null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#f1f5f9', color: '#64748b' }}>
                          <FaMapMarkerAlt size={10} /> {formatDistance(avail.distance)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Updated {timeAgo(avail.lastUpdated)}</div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
