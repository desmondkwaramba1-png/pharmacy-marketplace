import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import type { SearchResult, StockStatus } from '../../types';
import { FiSearch, FiX, FiMap, FiChevronLeft, FiWifiOff, FiPhone, FiBell } from 'react-icons/fi';
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

  const getDirections = (result: SearchResult) => {
    // Try to get pharmacy coordinates via pharmacy page later; for now open search
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.pharmacyName + ' ' + result.address + ' Zimbabwe')}`;
    window.open(url, '_blank');
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
                  <img src={result.imageUrl} alt={result.medicineName} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', background: '#f5f5f5' }} />
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
                  <div className="pharmacy-name">{result.pharmacyName}</div>
                  <div className="pharmacy-address">{result.address}{result.suburb ? `, ${result.suburb}` : ''}</div>
                  <div className="card-status-row">
                    <Badge status={result.stockStatus as StockStatus} />
                    {result.distance != null && (
                      <span className="distance-chip"><FaMapMarkerAlt /> {formatDistance(result.distance)}</span>
                    )}
                    {result.price != null && (
                      <span className="distance-chip">${result.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="last-updated">Updated {timeAgo(result.lastUpdated)}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {result.phone && (
                  <button className="btn-outline-sm" onClick={() => callPharmacy(result.phone)}>
                    <FiPhone /> Call
                  </button>
                )}
                <button className="btn-outline-sm" onClick={() => getDirections(result)}>
                  <FaMapMarkerAlt /> Directions
                </button>
                {result.stockStatus === 'out_of_stock' && (
                  <button className="btn-outline-sm"><FiBell /> Notify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
