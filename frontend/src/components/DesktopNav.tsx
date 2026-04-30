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
    <header className="desktop-nav-header">
      <div className="desktop-nav-container">
        <NavLink to="/" className="desktop-nav-logo">
          <div className="header-logo">💊</div>
          <span className="logo-text">MediFind <span className="text-secondary">ZW</span></span>
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
              <span className="cart-badge">{cart.itemCount}</span>
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
