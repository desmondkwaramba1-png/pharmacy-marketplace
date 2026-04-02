import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMap, FiUser } from 'react-icons/fi';

export default function BottomNav() {
  const { isAuthenticated, user } = useAuth();

  const tabs = [
    { to: '/', label: 'Search', icon: <FiSearch size={22} />, exact: true },
    { to: '/map', label: 'Map', icon: <FiMap size={22} /> },
    { to: '/login', label: isAuthenticated ? (user?.firstName || 'Account') : 'Sign In', icon: <FiUser size={22} /> },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.exact}
          className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
          aria-label={tab.label}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
