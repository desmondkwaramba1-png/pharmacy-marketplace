import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../../api/medicines';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import {
  FiSearch, FiX, FiClock, FiChevronRight, FiMapPin,
  FiShoppingCart, FiUser, FiArrowRight,
} from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const RECENT_KEY = 'medifind_recent';

const CATEGORIES = [
  { icon: '💊', label: 'Pain Relief',  query: 'paracetamol',     color: '#0284a8', bg: 'linear-gradient(135deg,#e0f4f8,#b3e5f0)' },
  { icon: '🩺', label: 'Antibiotics',  query: 'amoxicillin',     color: '#7C3AED', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
  { icon: '❤️',  label: 'Cardiac',     query: 'aspirin',         color: '#059669', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
  { icon: '🫁', label: 'Respiratory', query: 'salbutamol',      color: '#D97706', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
  { icon: '🩹', label: 'Wound Care',  query: 'antiseptic',      color: '#DC2626', bg: 'linear-gradient(135deg,#FEE2E2,#FECACA)' },
  { icon: '💉', label: 'Vitamins',    query: 'vitamin',         color: '#0891b2', bg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
  { icon: '🧴', label: 'Skin Care',   query: 'hydrocortisone',  color: '#7C3AED', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
  { icon: '👁️', label: 'Eye Drops',   query: 'eye drops',       color: '#059669', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
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
  const [recentList, setRecentList] = useState<string[]>(getRecent);
  useDebounce(query, 400); // trigger debounce side-effect only
  const { coords } = useGeolocation();

  const { data: popular } = useQuery<any[]>({
    queryKey: ['popular-medicines', coords?.lat, coords?.lng],
    queryFn: () => medicinesApi.getPopular(coords?.lat, coords?.lng),
    staleTime: 60 * 1000,
  });

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setRecentList(getRecent());
    navigate(`/search?q=${encodeURIComponent(q.trim())}${coords ? `&lat=${coords.lat}&lng=${coords.lng}` : ''}`);
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat.query);
    handleSearch(cat.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentList([]);
  };

  return (
    <div className="page">
      <style>{`
        @keyframes hp-fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        .hp-cat-chip:hover { opacity: 0.85; transform: translateY(-2px); }
        .hp-popular-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(2,132,168,0.15) !important; }
        .hp-recent-item:hover { background: #f8fafc; cursor: pointer; }
      `}</style>

      {/* Glassmorphism sticky header */}
      <header style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #eef2f7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaPills color="#fff" size={16} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>MediFind</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              if (isAuthenticated) setCartOpen(true);
              else navigate(`/login?returnTo=${encodeURIComponent('/')}&message=${encodeURIComponent('Please sign in to access your cart')}`);
            }}
            style={{ position: 'relative', color: '#0284a8', background: '#f0f9ff', borderRadius: 10, padding: 8, border: '1.5px solid rgba(2,132,168,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label="View Cart"
          >
            <FiShoppingCart size={19} />
            {cart && cart.itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#ef4444',
                color: 'white', fontSize: 10, minWidth: 17, height: 17, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                border: '2px solid white', padding: '0 3px',
              }}>
                {cart.itemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/reservations' : '/login')}
            style={{ color: '#0284a8', background: '#f0f9ff', borderRadius: 10, padding: 8, border: '1.5px solid rgba(2,132,168,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label={isAuthenticated ? 'Account' : 'Sign In'}
          >
            <FiUser size={19} />
          </button>
        </div>
      </header>

      {/* Teal-to-green gradient hero */}
      <div style={{
        background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)',
        padding: '24px 16px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 65%)', top: -160, left: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.18) 0%, transparent 70%)', bottom: -60, right: '20%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {isAuthenticated && user?.firstName && (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6, animation: 'hp-fadeInUp 0.4s ease both' }}>
              Hello, {user.firstName} 👋
            </div>
          )}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, margin: '0 0 6px' }}>MediFind ZW</p>
          <h1 style={{ fontSize: 'clamp(24px, 7vw, 34px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px', animation: 'hp-fadeInUp 0.45s ease both' }}>
            Find Medicines<br />Near You
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(2,132,168,0.2)', borderRadius: 999, padding: '5px 14px' }}>
            <FiMapPin size={13} color="#0284a8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0284a8' }}>{coords ? 'Using your location' : 'Harare, Zimbabwe'}</span>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Lifted search card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 -4px 24px rgba(2,132,168,0.08), 0 8px 32px rgba(0,0,0,0.08)',
          border: '1.5px solid #e2e8f0',
          padding: '16px',
          marginTop: -20,
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 12, padding: '0 12px', height: 48, gap: 10, border: '1.5px solid #e2e8f0' }}>
            <FiSearch color="#0284a8" size={18} />
            <input
              type="search"
              autoComplete="off"
              placeholder="Search medicines, e.g. Paracetamol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }} aria-label="Clear">
                <FiX size={16} />
              </button>
            )}
          </div>
          {query.length >= 2 && (
            <button
              style={{ marginTop: 12, width: '100%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => handleSearch(query)}
            >
              <FiSearch size={16} /> Search Medicines
            </button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Browse by Category</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.query}
                className="hp-cat-chip"
                onClick={() => handleCategoryClick(cat)}
                aria-label={cat.label}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 14px',
                  background: activeCategory === cat.query ? cat.bg : '#fff',
                  border: `1.5px solid ${activeCategory === cat.query ? cat.color + '40' : '#e2e8f0'}`,
                  borderRadius: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  minWidth: 76,
                }}
              >
                <span style={{ fontSize: 24 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: activeCategory === cat.query ? cat.color : '#475569', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent searches */}
        {recentList.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Recent Searches</h2>
              <button onClick={clearRecent} style={{ fontSize: 13, color: '#0284a8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear</button>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {recentList.map((r, i) => (
                <div
                  key={r}
                  className="hp-recent-item"
                  onClick={() => handleSearch(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < recentList.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <FiClock size={15} color="#94a3b8" />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{r}</span>
                  <FiChevronRight size={15} color="#cbd5e1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular medicines grid */}
        {popular && popular.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>Available Now</p>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Common Medicines</h2>
              </div>
              <button
                style={{ fontSize: 13, color: '#0284a8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => navigate('/search?q=medicine')}
              >
                View all <FiArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {popular.slice(0, 8).map((med) => (
                <div
                  key={med.medicineId || med.id}
                  className="hp-popular-card"
                  onClick={() => navigate(`/medicine/${med.medicineId || med.id}${coords ? `?lat=${coords.lat}&lng=${coords.lng}` : ''}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={med.medicineName || med.genericName}
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #e0f2fe, #ccfbf1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {med.imageUrl ? (
                        <img src={med.imageUrl} alt={med.medicineName || med.genericName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <FaPills color="#0284a8" size={20} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, letterSpacing: '-0.01em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {med.medicineName || med.genericName}
                      </div>
                      {(med.dosage) && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{med.dosage}</div>}
                    </div>
                  </div>

                  {med.pharmacyName ? (
                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Nearest</span>
                        {med.distance != null && (
                          <span style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 500 }}>
                            <FiMapPin size={9} />{med.distance < 1 ? `${Math.round(med.distance * 1000)}m` : `${med.distance.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{med.pharmacyName}</div>
                      {med.price != null && (
                        <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: '#0284a8' }}>${Number(med.price).toFixed(2)}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, background: '#fee2e2', padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.15)' }}>
                      Out of stock nearby
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 28, borderRadius: 20, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #014d5e 100%)', padding: '18px 20px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Simple process</p>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>How MediFind Works</h3>
          </div>
          <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '01', title: 'Search', desc: 'Type any medicine name or browse by category', color: '#0284a8', bg: 'linear-gradient(135deg,#e0f4f8,#b3e5f0)' },
              { num: '02', title: 'Compare & Reserve', desc: 'See real-time stock across pharmacies near you', color: '#7C3AED', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
              { num: '03', title: 'Collect', desc: 'Head to the pharmacy — your order is waiting', color: '#059669', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
            ].map((step) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${step.color}22` }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: step.color }}>{step.num}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}
