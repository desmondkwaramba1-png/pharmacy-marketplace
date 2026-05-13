import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMap, FiUser, FiClock } from 'react-icons/fi';

export default function BottomNav() {
  const { isAuthenticated, user } = useAuth();

  const tabs = [
    { to: '/home', label: 'Search', icon: FiSearch, exact: true },
    { to: '/map', label: 'Map', icon: FiMap },
    { to: '/reservations', label: 'Bookings', icon: FiClock },
    { to: '/login', label: isAuthenticated ? (user?.firstName || 'Account') : 'Sign In', icon: FiUser },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <span className="bottom-nav-icon"><Icon size={22} /></span>
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
