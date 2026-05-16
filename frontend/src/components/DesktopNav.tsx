import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiSearch, FiMap, FiUser, FiClock, FiShoppingCart } from 'react-icons/fi';

export default function DesktopNav() {
  const { isAuthenticated, user } = useAuth();
  const { cart, setCartOpen } = useCart();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');

  const links = [
    { to: '/', label: 'Home', icon: <FiSearch /> },
    { to: '/map', label: 'Map View', icon: <FiMap /> },
    { to: '/reservations', label: 'My Bookings', icon: <FiClock /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="desktop-nav-header" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
      <div className="desktop-nav-container">
        <NavLink to="/home" className="desktop-nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>MediFind <span style={{ color: '#0284a8' }}>ZW</span></span>
        </NavLink>

        <form className="desktop-search-form" onSubmit={handleSearch}>
          <div className="desktop-search-input-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for medicines..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="desktop-nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({ color: isActive ? '#0284a8' : undefined })}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="desktop-nav-actions">
          <button
            className="desktop-cart-btn"
            onClick={() => {
              if (isAuthenticated) {
                setCartOpen(true);
              } else {
                navigate('/login');
              }
            }}
          >
            <FiShoppingCart size={20} />
            {cart && cart.itemCount > 0 && (
              <span className="cart-badge" style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', boxShadow: '0 2px 8px rgba(2,132,168,0.4)' }}>{cart.itemCount}</span>
            )}
          </button>

          <NavLink to="/login" className="desktop-user-btn">
            <FiUser size={20} />
            <span className="user-label">
              {isAuthenticated ? (user?.firstName || 'Account') : 'Sign In'}
            </span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
