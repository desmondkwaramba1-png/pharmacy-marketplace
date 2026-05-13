import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBox, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { FaClinicMedical, FaPills } from 'react-icons/fa';

const tabs = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome size={22} /> },
  { to: '/admin/pickups',   label: 'Pickups',   icon: <FiShoppingBag size={22} /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <FiBox size={22} /> },
  { to: '/admin/profile',   label: 'Pharmacy',  icon: <FaClinicMedical size={22} /> },
];

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile top header — hidden on desktop */}
      <header className="admin-header admin-header-mobile">
        <div className="admin-header-left">
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaPills size={16} color="white" />
          </div>
          <div>
            <div className="admin-pharmacy-name">{user?.pharmacy?.name ?? 'MediFind Admin'}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--color-error-bg)', color: 'var(--color-error)',
            border: 'none', borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <FiLogOut size={16} /> Logout
        </button>
      </header>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="bottom-nav admin-bottom-nav" aria-label="Admin navigation">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
