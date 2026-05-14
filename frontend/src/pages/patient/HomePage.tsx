import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { Medicine } from '../../types';
import { FiSearch, FiX, FiClock, FiChevronRight, FiMapPin, FiShoppingCart, FiUser, FiArrowRight } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const RECENT_KEY = 'medifind_recent';

const CATEGORIES = [
  { icon: '💊', label: 'Pain Relief', query: 'paracetamol' },
  { icon: '🩺', label: 'Antibiotics', query: 'amoxicillin' },
  { icon: '❤️', label: 'Cardiac', query: 'aspirin' },
  { icon: '🫁', label: 'Respiratory', query: 'salbutamol' },
  { icon: '🩹', label: 'Wound Care', query: 'antiseptic' },
  { icon: '💉', label: 'Vitamins', query: 'vitamin' },
  { icon: '🧴', label: 'Skin Care', query: 'hydrocortisone' },
  { icon: '👁️', label: 'Eye Drops', query: 'eye drops' },
];

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat.query);
    handleSearch(cat.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  return (
    <div className="page">
      <style>{`
        @keyframes hp-fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)',
        padding: '20px 16px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 65%)', top: -160, left: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.18) 0%, transparent 70%)', bottom: -60, right: '20%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#0284a8', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 12px', border: '1px solid rgba(2,132,168,0.2)' }}>
              🇿🇼 Zimbabwe
            </div>
            {isAuthenticated && user?.firstName && (
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 6, animation: 'hp-fadeInUp 0.4s ease both' }}>
                Hello, {user.firstName} 👋
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                if (isAuthenticated) setCartOpen(true);
                else navigate(`/login?returnTo=${encodeURIComponent('/')}&message=${encodeURIComponent('Please sign in to access your cart')}`);
              }}
              style={{ position: 'relative', color: '#0284a8', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: 10, border: '1.5px solid rgba(2,132,168,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              aria-label="View Cart"
            >
              <FiShoppingCart size={20} />
              {cart && cart.itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, background: '#ef4444',
                  color: 'white', fontSize: 10, minWidth: 18, height: 18, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  border: '2px solid white', padding: '0 4px',
                }}>
                  {cart.itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ color: '#0284a8', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: 10, border: '1.5px solid rgba(2,132,168,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              aria-label={isAuthenticated ? 'Account' : 'Sign In'}
            >
              <FiUser size={20} />
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, animation: 'hp-fadeInUp 0.45s ease both' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>MediFind ZW</p>
          <h1 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 12px' }}>
            Find Medicines<br />Near You
          </h1>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(2,132,168,0.2)', borderRadius: 999, padding: '5px 14px', position: 'relative', zIndex: 1 }}>
          <FiMapPin size={13} color="#0284a8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0284a8' }}>{coords ? 'Using your location' : 'Harare, Zimbabwe'}</span>
        </div>
      </div>

      <div className="page-content">
        {/* Lifted search card */}
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
              style={{ marginTop: 12 }}
              onClick={() => handleSearch(query)}
            >
              <FiSearch size={16} /> Search Medicines
            </button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ marginTop: 24 }}>
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="category-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.query}
                className={`category-chip ${activeCategory === cat.query ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
                aria-label={cat.label}
              >
                <span className="category-chip-icon">{cat.icon}</span>
                <span className="category-chip-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent searches */}
        {recent.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-header">
              <h2 className="section-title">Recent Searches</h2>
              <button
                className="btn-ghost btn"
                onClick={() => { localStorage.removeItem(RECENT_KEY); window.location.reload(); }}
              >
                Clear
              </button>
            </div>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '0 12px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {recent.map((r, i) => (
                <div
                  key={r}
                  className="recent-item"
                  onClick={() => handleSearch(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(r)}
                  style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <span style={{ fontSize: 16, color: 'var(--color-text-secondary)', display: 'flex' }}><FiClock /></span>
                  <span className="recent-item-text">{r}</span>
                  <span style={{ color: 'var(--color-text-disabled)', fontSize: 16, display: 'flex' }}><FiChevronRight /></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular medicines grid */}
        {popular && popular.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="section-header">
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>Available Now</p>
                <h2 className="section-title" style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Common Medicines</h2>
              </div>
              <button
                className="btn-ghost btn"
                style={{ fontSize: 13, gap: 4 }}
                onClick={() => navigate('/search?q=medicine')}
              >
                View all <FiArrowRight size={14} />
              </button>
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14 }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div
                      className="popular-card-icon"
                      style={{ overflow: med.imageUrl ? 'hidden' : undefined }}
                    >
                      {med.imageUrl ? (
                        <img
                          src={med.imageUrl}
                          alt={med.genericName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7v-2h-2V8h-2v2H8v2h2v2h2v-2h2z'/%3E%3C/svg%3E"; }}
                        />
                      ) : (
                        <FaPills color="var(--color-primary)" size={26} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="popular-card-name">{med.genericName}</div>
                      {med.dosage && <div className="popular-card-dosage">{med.dosage}</div>}
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                        {[med.brandName, med.form].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {med.nearestPharmacy ? (
                    <div style={{
                      background: 'var(--color-bg)',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          Nearest
                        </span>
                        {med.distance != null && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                            <FiMapPin size={10} />
                            {med.distance < 1 ? `${Math.round(med.distance * 1000)}m` : `${med.distance.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{med.nearestPharmacy.name}</div>
                      {(med.price != null || med.standardPrice != null) && (
                        <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>
                          ${(med.price ?? med.standardPrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: 12, color: 'var(--color-error)', fontWeight: 600,
                      background: 'var(--color-error-bg)', padding: '8px 12px',
                      borderRadius: 8, border: '1px solid rgba(232,93,93,0.2)',
                    }}>
                      Out of stock nearby
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{
          marginTop: 28,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, textAlign: 'center' }}>
            How it works
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {[
              { step: '①', label: 'Search' },
              { step: '→', label: '' },
              { step: '②', label: 'View Stocks' },
              { step: '→', label: '' },
              { step: '③', label: 'Get Directions' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontSize: item.step === '→' ? 16 : 20,
                  color: item.step === '→' ? 'var(--color-border)' : 'var(--color-primary)',
                  fontWeight: 700,
                }}>
                  {item.step}
                </span>
                {item.label && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
