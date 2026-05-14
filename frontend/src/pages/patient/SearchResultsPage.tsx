import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { SearchResult, StockStatus } from '../../types';
import { FiSearch, FiX, FiMap, FiChevronLeft, FiWifiOff, FiPhone, FiBell, FiShoppingCart, FiLogIn, FiFilter } from 'react-icons/fi';
import { FaMapMarkerAlt, FaPills } from 'react-icons/fa';

function formatDistance(km: number | null | undefined): string {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const FILTERS: { label: string; value: string; icon: string }[] = [
  { label: 'All',       value: '',          icon: '💊' },
  { label: 'In Stock',  value: 'in_stock',  icon: '✅' },
  { label: 'Low Stock', value: 'low_stock', icon: '⚠️' },
];

function stockBadge(status: string) {
  if (status === 'in_stock') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#d1fae5', color: '#059669' }}>
      ✓ In Stock
    </span>
  );
  if (status === 'low_stock') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fef3c7', color: '#D97706' }}>
      ⚠ Low Stock
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fee2e2', color: '#dc2626' }}>
      ✕ Out of Stock
    </span>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { coords } = useGeolocation();

  const urlQuery = searchParams.get('q') || '';
  const urlLat   = searchParams.get('lat');
  const urlLng   = searchParams.get('lng');

  const { cart, setCartOpen, addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedInput = useDebounce(searchInput, 400);
  const [activeFilter, setActiveFilter] = useState('');

  const lat = coords?.lat ?? (urlLat ? parseFloat(urlLat) : null);
  const lng = coords?.lng ?? (urlLng ? parseFloat(urlLng) : null);

  const q = debouncedInput || urlQuery;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', q, lat, lng, activeFilter],
    queryFn: () => medicinesApi.search(q, lat, lng, activeFilter || undefined),
    enabled: q.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}${lat ? `&lat=${lat}&lng=${lng}` : ''}`);
    }
  };

  const getDirections = (result: any) => {
    if (result.latitude && result.longitude) {
      navigate(`/map?destLat=${result.latitude}&destLng=${result.longitude}`);
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.pharmacyName + ' ' + result.address + ' Zimbabwe')}`, '_blank');
    }
  };

  return (
    <div className="page">
      <style>{`
        @keyframes srp-fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sticky search header — white glassmorphism */}
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
          onClick={() => navigate('/')}
          aria-label="Back"
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 }}
        >
          <FiChevronLeft size={20} />
        </button>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 12, padding: '0 12px', height: 40, gap: 8, border: '1.5px solid #e2e8f0' }}>
          <FiSearch color="#0284a8" size={16} />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search medicines..."
            autoComplete="off"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a' }}
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}><FiX size={15} /></button>
          )}
        </form>
        <button
          onClick={() => navigate('/map')}
          title="View Map"
          aria-label="Map view"
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 }}
        >
          <FiMap size={18} />
        </button>
        <button
          onClick={() => {
            if (isAuthenticated) setCartOpen(true);
            else navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          }}
          style={{ position: 'relative', background: 'linear-gradient(135deg, #0284a8, #02C39A)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(2,132,168,0.3)' }}
          aria-label="Cart"
        >
          <FiShoppingCart size={18} />
          {cart && cart.itemCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              background: '#ef4444', color: 'white',
              fontSize: 9, width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, border: '1.5px solid white',
            }}>
              {cart.itemCount}
            </span>
          )}
        </button>
      </header>

      <div className="page-content">
        {/* Filters */}
        <div className="filter-pills" style={{ marginBottom: 14 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`pill ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {data && (
          <p className="results-count">
            <strong>{data.total}</strong> result{data.total !== 1 ? 's' : ''} for "<strong>{data.query}</strong>" — nearest first
          </p>
        )}

        {/* Loading state */}
        {isLoading && <SkeletonList count={4} />}

        {/* Error state */}
        {isError && (
          <div className="empty-state">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}><FiWifiOff /></div>
            <div className="empty-state-title">Connection Error</div>
            <div className="empty-state-text">Check your internet and try again</div>
          </div>
        )}

        {/* Empty search query */}
        {!isLoading && q.length < 2 && (
          <div className="empty-state">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}><FiSearch /></div>
            <div className="empty-state-title">Start typing to search</div>
            <div className="empty-state-text">Enter at least 2 characters to find medicines near you</div>
          </div>
        )}

        {/* No results */}
        {!isLoading && data && data.results.length === 0 && (
          <div className="empty-state">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #0284a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}><FaPills /></div>
            <div className="empty-state-title">No medicines found</div>
            <div className="empty-state-text">Try a different search term or check spelling</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSearchInput('')}>Clear Search</button>
          </div>
        )}

        {/* Results */}
        <div className="results-list">
          {data?.results.map((result, idx) => (
            <div
              key={`${result.medicineId}-${result.pharmacyId}-${idx}`}
              onClick={() => navigate(`/medicine/${result.medicineId}${lat ? `?lat=${lat}&lng=${lng}` : ''}`)}
              role="button"
              tabIndex={0}
              style={{
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderLeft: '3px solid #0284a8',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                padding: 16,
                marginBottom: 12,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                animation: idx < 8 ? `srp-fadeInUp 0.4s ease ${(idx * 0.05).toFixed(2)}s both` : undefined,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(2,132,168,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              {/* Medicine identity */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt={result.medicineName}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', background: '#f5f5f5', flexShrink: 0 }}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7v-2h-2V8h-2v2H8v2h2v2h2v-2h2z'/%3E%3C/svg%3E"; }}
                  />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #e0f2fe, #ccfbf1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaPills color="#0284a8" size={22} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{result.medicineName}</span>
                    {result.dosage && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{result.dosage}</span>}
                    {result.requiresPrescription ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#0f172a', color: '#fff' }}>🔒 Rx</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#d1fae5', color: '#059669' }}>✓ OTC</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    {[result.form, result.brandName, result.category].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>

              {/* Pharmacy info */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 14, marginTop: 1, color: '#0284a8', flexShrink: 0 }}><FaMapMarkerAlt /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{result.pharmacyName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{result.address}{result.suburb ? `, ${result.suburb}` : ''}</div>
                </div>
              </div>

              {/* Price + availability row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 10, marginBottom: 8,
                background: '#f8fafc', padding: '10px 14px',
                borderRadius: 12, border: '1px solid #e2e8f0',
                flexWrap: 'wrap', gap: 8,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0284a8', letterSpacing: '-0.02em' }}>
                    {result.price != null ? `$${result.price.toFixed(2)}` : 'N/A'}
                  </div>
                </div>
                <div>{stockBadge(result.stockStatus)}</div>
                {result.distance != null && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#e0f2fe', color: '#0284a8' }}>
                    <FaMapMarkerAlt size={10} /> {formatDistance(result.distance)}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Updated {timeAgo(result.lastUpdated)}</div>

              {/* Action buttons */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
              >
                {result.stockStatus !== 'out_of_stock' ? (
                  isAuthenticated ? (
                    <button
                      style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={(e) => { e.stopPropagation(); addToCart(result.pharmacyId, result.medicineId); }}
                    >
                      <FiShoppingCart size={15} /> Add to Cart
                    </button>
                  ) : (
                    <button
                      style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
                    >
                      <FiLogIn size={15} /> Sign In to Reserve
                    </button>
                  )
                ) : (
                  <button style={{ flex: 1, minWidth: 120, background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} disabled>
                    <FiBell size={15} /> Notify Me
                  </button>
                )}

                <button
                  style={{ flex: 1, minWidth: 120, background: '#f8fafc', color: '#0284a8', border: '1.5px solid #0284a8', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={(e) => { e.stopPropagation(); getDirections(result); }}
                >
                  <FaMapMarkerAlt size={14} /> Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
