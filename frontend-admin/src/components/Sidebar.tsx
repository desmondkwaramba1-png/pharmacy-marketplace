import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiLogOut, FiShoppingBag, FiSettings, FiUser, FiHelpCircle } from 'react-icons/fi';
import { FaClinicMedical, FaPills } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/admin/pickups', label: 'Pickup Orders', icon: <FiShoppingBag /> },
    { to: '/admin/inventory', label: 'Inventory Management', icon: <FiBox /> },
    { to: '/admin/profile', label: 'Pharmacy Profile', icon: <FaClinicMedical /> },
  ];

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <span className="admin-logo"><FaPills color="var(--color-primary)" /></span>
        <span className="logo-text">MediFind <span className="text-secondary">Admin</span></span>
      </div>

      <div className="sidebar-user-info">
        <div className="user-avatar">{user?.firstName?.[0] || 'A'}</div>
        <div className="user-details">
          <div className="user-name">{user?.firstName} {user?.lastName}</div>
          <div className="user-role">Pharmacist</div>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-title">Management</span>
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
        <NavLink to="/admin/settings" className="sidebar-link">
          <FiSettings /> <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', textAlign: 'left' }}>
          <FiLogOut /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
