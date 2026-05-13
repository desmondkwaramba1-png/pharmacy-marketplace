import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { FaClinicMedical, FaPills } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/pickups', label: 'Pickup Orders', icon: <FiShoppingBag /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <FiBox /> },
  { to: '/admin/profile', label: 'Pharmacy Profile', icon: <FaClinicMedical /> },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="desktop-sidebar admin-sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: 28 }}><FaPills color="var(--color-primary)" /></span>
        <span className="logo-text">MediFind <span className="text-secondary">Admin</span></span>
      </div>

      <div className="sidebar-user-info">
        <div className="user-avatar">{user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}</div>
        <div className="user-details">
          <div className="user-name">{user?.firstName} {user?.lastName}</div>
          <div className="user-role">Pharmacist</div>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-title">Management</span>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
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
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FiLogOut /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
