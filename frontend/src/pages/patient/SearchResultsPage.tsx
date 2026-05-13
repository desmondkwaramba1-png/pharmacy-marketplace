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
        <button
          className="btn-icon"
          onClick={() => navigate('/map')}
          title="View Map"
          aria-label="Map view"
        >
          <FiMap />
        </button>
        <button
          className="btn-icon"
          onClick={() => {
            if (isAuthenticated) setCartOpen(true);
            else navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          }}
          style={{ position: 'relative' }}
          aria-label="Cart"
        >
          <FiShoppingCart />
          {cart && cart.itemCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              background: 'var(--color-error)', color: 'white',
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
            <div className="empty-state-text">Enter at least 2 characters to find medicines near you</div>
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
              {/* Medicine identity */}
              <div className="medicine-card-header" style={{ gap: 12 }}>
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt={result.medicineName}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', background: '#f5f5f5', flexShrink: 0 }}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7v-2h-2V8h-2v2H8v2h2v2h2v-2h2z'/%3E%3C/svg%3E"; }}
                  />
                ) : (
                  <div className="medicine-icon"><FaPills color="var(--color-primary)" /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="medicine-name">
                    {result.medicineName}
                    {result.dosage && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}> {result.dosage}</span>}
                  </div>
                  <div className="medicine-meta">
                    {[result.form, result.brandName, result.category].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>

              {/* Pharmacy info */}
              <div className="medicine-card-pharmacy">
                <span style={{ fontSize: 15, marginTop: 1, color: 'var(--color-primary)', flexShrink: 0 }}><FaMapMarkerAlt /></span>
                <div className="pharmacy-info">
                  <div className="pharmacy-name">{result.pharmacyName}</div>
                  <div className="pharmacy-address">{result.address}{result.suburb ? `, ${result.suburb}` : ''}</div>

                  {/* Price + availability row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 10, marginBottom: 6,
                    background: 'var(--color-bg)', padding: '10px 12px',
                    borderRadius: 10, border: '1px solid var(--color-border)',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</div>
                      <div className="medicine-price">
                        {result.price != null ? `$${result.price.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'var(--color-border)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</div>
                      <Badge status={result.stockStatus as StockStatus} />
                    </div>
                    {result.distance != null && (
                      <>
                        <div style={{ width: 1, height: 28, background: 'var(--color-border)' }} />
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance</div>
                          <span className="distance-chip" style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13, fontWeight: 600 }}>
                            {formatDistance(result.distance)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="last-updated">Updated {timeAgo(result.lastUpdated)}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}
              >
                {result.stockStatus !== 'out_of_stock' ? (
                  isAuthenticated ? (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: 120 }}
                      onClick={(e) => { e.stopPropagation(); addToCart(result.pharmacyId, result.medicineId); }}
                    >
                      <FiShoppingCart size={15} /> Add to Cart
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: 120 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
                    >
                      <FiLogIn size={15} /> Sign In to Reserve
                    </button>
                  )
                ) : (
                  <button className="btn btn-secondary" style={{ flex: 1, minWidth: 120 }} disabled>
                    <FiBell size={15} /> Notify Me
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: 120 }}
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
