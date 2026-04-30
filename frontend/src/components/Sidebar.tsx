import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiMap, FiClock, FiHeart, FiSettings, FiHelpCircle, FiShoppingBag } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate();
  const menuItems = [
    { to: '/', label: 'Search Medicines', icon: <FiSearch /> },
    { to: '/map', label: 'Pharmacy Map', icon: <FiMap /> },
    { to: '/reservations', label: 'My Bookings', icon: <FiClock /> },
    { to: '/favorites', label: 'Favorites', icon: <FiHeart /> },
  ];

  const categoryItems = [
    { label: 'Pain Relief', icon: '💊' },
    { label: 'Antibiotics', icon: '🦠' },
    { label: 'Chronic Care', icon: '❤️' },
    { label: 'Vitamins', icon: '⚡' },
  ];

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <div className="header-logo">💊</div>
        <span className="logo-text">MediFind <span className="text-secondary">ZW</span></span>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-title">Main Menu</span>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-title">Categories</span>
        <div className="sidebar-categories">
          {categoryItems.map((cat) => (
            <button 
              key={cat.label} 
              className="sidebar-category-btn"
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.label)}`)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/help" className="sidebar-link">
          <FiHelpCircle /> <span>Support</span>
        </NavLink>
        <NavLink to="/settings" className="sidebar-link">
          <FiSettings /> <span>Settings</span>
        </NavLink>
      </div>

      <div className="sidebar-promo">
        <div className="promo-card">
          <FiShoppingBag className="promo-icon" />
          <p>Download our mobile app for better experience</p>
          <button className="btn btn-sm btn-full btn-primary" style={{ marginTop: 8 }}>Get App</button>
        </div>
      </div>
    </aside>
  );
}
