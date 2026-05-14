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
    <nav
      className="bottom-nav"
      aria-label="Main navigation"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <style>{`
        .bottom-nav-tab { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 12px; text-decoration: none; border: none; background: none; cursor: pointer; flex: 1; transition: all 0.2s ease; }
        .bottom-nav-tab .bnav-icon-wrap { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .bottom-nav-tab .bnav-label { font-size: 10px; font-weight: 500; color: #94a3b8; transition: all 0.2s ease; }
        .bottom-nav-tab.active .bnav-icon-wrap { background: linear-gradient(135deg, #0284a8, #02C39A); box-shadow: 0 4px 12px rgba(2,132,168,0.3); }
        .bottom-nav-tab.active .bnav-label { color: #0284a8; font-weight: 700; }
      `}</style>
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
            {({ isActive }) => (
              <>
                <span className="bnav-icon-wrap">
                  <Icon size={20} color={isActive ? '#fff' : '#94a3b8'} />
                </span>
                <span className="bnav-label">{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
