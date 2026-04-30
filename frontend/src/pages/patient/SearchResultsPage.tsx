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
import { FiSearch, FiX, FiMap, FiChevronLeft, FiWifiOff, FiPhone, FiBell, FiShoppingCart, FiLogIn } from 'react-icons/fi';
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
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: '✅ In Stock', value: 'in_stock' },
  { label: '⚠️ Low Stock', value: 'low_stock' },
];

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { coords } = useGeolocation();

  const urlQuery = searchParams.get('q') || '';
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');

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
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.pharmacyName + ' ' + result.address + ' Zimbabwe')}`;
      window.open(url, '_blank');
    }
  };

  const callPharmacy = (phone?: string) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  return (
    <div className="page">
      {/* Sticky search header */}
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Back"><FiChevronLeft /></button>
        <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon"><FiSearch /></span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search medicines..."
            autoComplete="off"
          />
          {searchInput && (
            <button type="button" className="clear-btn" onClick={() => setSearchInput('')}><FiX /></button>
          )}
        </form>
        <button className="btn-icon" onClick={() => navigate('/map')} title="View Map" aria-label="Map view"><FiMap /></button>
        <button 
          className="btn-icon" 
          onClick={() => {
            if (isAuthenticated) {
              setCartOpen(true);
            } else {
              navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent('Please sign in to access your cart and personalized experience')}`);
            }
          }} 
          style={{ position: 'relative' }}
        >
          <FiShoppingCart />
          {cart && cart.itemCount > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--color-error)', color: 'white', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cart.itemCount}
            </span>
          )}
        </button>
      </header>

      <div className="page-content">
        {/* Filters */}
        <div className="filter-pills" style={{ marginBottom: 12 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`pill ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {data && (
          <p className="results-count">
            Found <strong>{data.total}</strong> result{data.total !== 1 ? 's' : ''} for "{data.query}" — sorted by distance
          </p>
        )}

        {/* Loading state */}
        {isLoading && <SkeletonList count={4} />}

        {/* Error state */}
        {isError && (
          <div className="empty-state">
            <div className="empty-state-icon"><FiWifiOff /></div>
            <div className="empty-state-title">Connection Error</div>
            <div className="empty-state-text">Check your internet and try again</div>
          </div>
        )}

        {/* Empty search query */}
        {!isLoading && q.length < 2 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FiSearch /></div>
            <div className="empty-state-title">Start typing to search</div>
            <div className="empty-state-text">Enter at least 2 characters to find medicines</div>
          </div>
        )}

        {/* No results */}
        {!isLoading && data && data.results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FaPills /></div>
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
              className="medicine-card"
              onClick={() => navigate(`/medicine/${result.medicineId}${lat ? `?lat=${lat}&lng=${lng}` : ''}`)}
              role="button"
              tabIndex={0}
            >
              <div className="medicine-card-header" style={{ gap: 12 }}>
                {result.imageUrl ? (
                  <img src={result.imageUrl} alt={result.medicineName} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', background: '#f5f5f5' }} loading="lazy" />
                ) : (
                  <div className="medicine-icon"><FaPills color="var(--color-primary)" /></div>
                )}
                <div style={{ flex: 1 }}>
                  <div className="medicine-name">{result.medicineName} {result.dosage && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{result.dosage}</span>}</div>
                  <div className="medicine-meta">
                    {[result.form, result.brandName, result.category].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>

              <div className="medicine-card-pharmacy">
                <span style={{ fontSize: 16, marginTop: 1, color: 'var(--color-primary)' }}><FaMapMarkerAlt /></span>
                <div className="pharmacy-info">
                  <div className="pharmacy-name" style={{ fontSize: '15px', fontWeight: 600 }}>{result.pharmacyName}</div>
                  <div className="pharmacy-address" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {result.address}{result.suburb ? `, ${result.suburb}` : ''}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', background: 'var(--color-bg)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Price</span>
                      <span className="medicine-price" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {result.price != null ? `$${result.price.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    <div style={{ height: '30px', width: '1px', background: 'var(--color-border)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                       <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Availability</span>
                       <Badge status={result.stockStatus as StockStatus} />
                    </div>
                  </div>

                  <div className="last-updated">Updated {timeAgo(result.lastUpdated)}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}
              >
                {result.stockStatus !== 'out_of_stock' ? (
                  isAuthenticated ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, minWidth: '120px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(result.pharmacyId, result.medicineId);
                      }}
                    >
                      <FiShoppingCart /> Add to Cart
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, minWidth: '120px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                      }}
                    >
                      <FiLogIn /> Sign In to Reserve
                    </button>
                  )
                ) : (
                  <button className="btn btn-secondary" style={{ flex: 1, minWidth: '120px' }} disabled>
                    <FiBell /> Notify Me
                  </button>
                )}

                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, minWidth: '120px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    getDirections(result);
                  }}
                >
                  <FaMapMarkerAlt /> Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
