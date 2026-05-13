import { NavLink } from 'react-router-dom';
import { FiSearch, FiMap, FiClock, FiHeart, FiHelpCircle } from 'react-icons/fi';

export default function Sidebar() {
  const menuItems = [
    { to: '/home', label: 'Search Medicines', icon: <FiSearch /> },
    { to: '/map', label: 'Pharmacy Map', icon: <FiMap /> },
    { to: '/reservations', label: 'My Bookings', icon: <FiClock /> },
    { to: '/favorites', label: 'Favourites', icon: <FiHeart /> },
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

      <div className="sidebar-footer">
        <NavLink to="/help" className="sidebar-link">
          <FiHelpCircle /> <span>Support</span>
        </NavLink>
      </div>
    </aside>
  );
}
