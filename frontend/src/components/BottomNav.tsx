import { NavLink } from 'react-router-dom';
import { FiSearch, FiMap, FiBriefcase } from 'react-icons/fi';

const tabs = [
  { to: '/', label: 'Search', icon: <FiSearch size={22} />, exact: true },
  { to: '/map', label: 'Map', icon: <FiMap size={22} /> },
  { to: '/admin/login', label: 'Admin', icon: <FiBriefcase size={22} /> },
];

export default function BottomNav() {
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
