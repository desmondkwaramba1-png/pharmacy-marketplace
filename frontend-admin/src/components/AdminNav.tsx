import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBox, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { FaClinicMedical, FaPills } from 'react-icons/fa';

const tabs = [
  { to: '/admin/dashboard', label: 'Home', icon: <FiHome size={22} /> },
  { to: '/admin/pickups', label: 'Pickups', icon: <FiShoppingBag size={22} /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <FiBox size={22} /> },
  { to: '/admin/profile', label: 'Pharmacy', icon: <FaClinicMedical size={22} /> },
];

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Top bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo"><FaPills color="var(--color-primary)" /></span>
          <div>
            <div className="admin-pharmacy-name">{user?.pharmacy?.name ?? 'MediFind Admin'}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-icon" title="Logout" aria-label="Logout">
          <FiLogOut size={20} color="var(--color-text)" />
        </button>
      </header>

      {/* Bottom tabs */}
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
