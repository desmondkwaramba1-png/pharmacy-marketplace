import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { Medicine } from '../../types';
import { FiSearch, FiX, FiClock, FiChevronRight, FiMapPin, FiShoppingCart, FiUser } from 'react-icons/fi';
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
  const { cart, setCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const { coords } = useGeolocation();
  const recent = getRecent();

  const { data: popular } = useQuery<any[]>({
    queryKey: ['popular-medicines', coords?.lat, coords?.lng],
    queryFn: () => medicinesApi.getPopular(coords?.lat, coords?.lng),
    staleTime: 60 * 1000,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="home-greeting">🇿🇼 Zimbabwe</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn-icon" 
              onClick={() => {
                if (isAuthenticated) {
                  setCartOpen(true);
                } else {
                  navigate(`/login?returnTo=${encodeURIComponent('/')}&message=${encodeURIComponent('Please sign in to access your cart and personalized experience')}`);
                }
              }} 
              style={{ color: 'white', position: 'relative', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: 8 }}
              aria-label="View Cart"
            >
              <FiShoppingCart size={22} />
              {cart && cart.itemCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: -4, right: -4, background: 'var(--color-error)', 
                  color: 'white', fontSize: 10, minWidth: 18, height: 18, borderRadius: 9, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  border: '2px solid var(--color-primary-dark, #026a78)', padding: '0 4px'
                }}>
                  {cart.itemCount}
                </span>
              )}
            </button>
            <button 
              className="btn-icon" 
              onClick={() => navigate('/login')} 
              style={{ color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: 8 }}
              aria-label={isAuthenticated ? 'Account' : 'Sign In'}
            >
              <FiUser size={22} />
            </button>
          </div>
        </div>
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="popular-card-icon" style={{ width: 64, height: 64, padding: med.imageUrl ? 0 : undefined, overflow: 'hidden', flexShrink: 0 }}>
                      {med.imageUrl ? (
                        <img src={med.imageUrl} alt={med.genericName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FaPills color="var(--color-primary)" size={32} />
                      )}
                    </div>
                    <div>
                      <div className="popular-card-name" style={{ lineHeight: 1.2, fontSize: 16 }}>{med.genericName}</div>
                      {med.dosage && <div className="popular-card-dosage" style={{ marginTop: 4 }}>{med.dosage}</div>}
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        {[med.brandName, med.form].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  
                  {med.nearestPharmacy && (
                    <div style={{ background: 'var(--color-bg)', padding: '10px 12px', borderRadius: 8, marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>Nearest available</span>
                        {med.distance != null && (
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiMapPin /> {(med.distance < 1 ? `${Math.round(med.distance * 1000)}m` : `${med.distance.toFixed(1)}km`)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{med.nearestPharmacy.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {med.nearestPharmacy.address}{med.nearestPharmacy.suburb ? `, ${med.nearestPharmacy.suburb}` : ''}
                      </div>
                      {(med.price != null || med.standardPrice != null) && (
                        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
                          ${(med.price ?? med.standardPrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                  {!med.nearestPharmacy && (
                    <div style={{ marginTop: 'auto', fontSize: 13, color: 'var(--color-error)', background: 'var(--color-error-bg)', padding: '8px 12px', borderRadius: 8 }}>
                      Currently out of stock
                    </div>
                  )}
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


      </div>
    </div>
  );
}
