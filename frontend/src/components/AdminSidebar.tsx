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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FaPills size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>MediFind</div>
          <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>Admin Portal</div>
        </div>
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--color-bg)', borderRadius: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--color-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700,
        }}>
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Pharmacist</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', padding: '0 12px', marginBottom: 6 }}>
          Management
        </div>
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

      {/* Logout — always visible at bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--color-error-bg)', color: 'var(--color-error)',
            fontSize: 14, fontWeight: 600, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fecaca')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-error-bg)')}
        >
          <FiLogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
