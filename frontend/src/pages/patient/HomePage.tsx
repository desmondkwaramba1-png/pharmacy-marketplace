import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';
import type { Medicine } from '../../types';
import { FiSearch, FiX, FiClock, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const RECENT_KEY = 'medifind_recent';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function saveRecent(q: string) {
  const recent = getRecent().filter((r) => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...recent].slice(0, 5)));
}

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const { coords } = useGeolocation();
  const recent = getRecent();

  const { data: popular } = useQuery<Medicine[]>({
    queryKey: ['popular-medicines'],
    queryFn: medicinesApi.getPopular,
    staleTime: 60 * 60 * 1000,
  });

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    navigate(`/search?q=${encodeURIComponent(q.trim())}${coords ? `&lat=${coords.lat}&lng=${coords.lng}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  return (
    <div className="page">
      {/* Hero header */}
      <div className="home-header">
        <div className="home-greeting">🇿🇼 Zimbabwe</div>
        <h1 className="home-title">Find Medicines Near You</h1>
        <div className="location-chip" onClick={() => {}}>
          <FiMapPin />
          <span>{coords ? 'Using your location' : 'Harare, Zimbabwe'}</span>
        </div>
      </div>

      {/* Lifted search card */}
      <div className="page-content">
        <div className="search-lift">
          <div className="search-bar">
            <span className="search-icon"><FiSearch /></span>
            <input
              id="medicine-search"
              type="search"
              autoComplete="off"
              placeholder="Search for medicine, e.g. Paracetamol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {query && (
              <button className="clear-btn" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>
            )}
          </div>
          {query.length >= 2 && (
            <button
              id="search-btn"
              className="btn btn-primary btn-full"
              style={{ marginTop: 10 }}
              onClick={() => handleSearch(query)}
            >
              Search
            </button>
          )}
        </div>

        {/* Recent searches */}
        {recent.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-header">
              <h2 className="section-title">Recent Searches</h2>
              <button className="btn-ghost btn" onClick={() => { localStorage.removeItem(RECENT_KEY); window.location.reload(); }}>
                Clear
              </button>
            </div>
            {recent.map((r) => (
              <div
                key={r}
                className="recent-item"
                onClick={() => handleSearch(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(r)}
              >
                <span style={{ fontSize: 18, color: 'var(--color-text-secondary)', display: 'flex' }}><FiClock /></span>
                <span className="recent-item-text">{r}</span>
                <span style={{ color: 'var(--color-text-disabled)', fontSize: 18, display: 'flex' }}><FiChevronRight /></span>
              </div>
            ))}
          </div>
        )}

        {/* Popular medicines grid */}
        {popular && popular.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-header">
              <h2 className="section-title">Common Medicines</h2>
            </div>
            <div className="popular-grid">
              {popular.map((med) => (
                <div
                  key={med.id}
                  className="popular-card"
                  onClick={() => navigate(`/medicine/${med.id}${coords ? `?lat=${coords.lat}&lng=${coords.lng}` : ''}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={med.genericName}
                >
                  <div className="popular-card-icon" style={{ padding: med.imageUrl ? 0 : undefined, overflow: 'hidden' }}>
                    {med.imageUrl ? (
                      <img src={med.imageUrl} alt={med.genericName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FaPills color="var(--color-primary)" />
                    )}
                  </div>
                  <div className="popular-card-name" style={{ textAlign: 'center', lineHeight: 1.2 }}>{med.genericName}</div>
                  {med.dosage && <div className="popular-card-dosage">{med.dosage}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="how-it-works" style={{ marginTop: 24, flexDirection: 'column', gap: 4, textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>How it works</span>
          <div className="how-it-works">
            <span>① Search</span>
            <span style={{ color: 'var(--color-border)' }}>→</span>
            <span>② View Stocks</span>
            <span style={{ color: 'var(--color-border)' }}>→</span>
            <span>③ Get Directions</span>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaPills /> Pharmacy? Manage your stock
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Keep your stock updated so patients can find you</div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/login')}>Admin Login →</button>
        </div>
      </div>
    </div>
  );
}
