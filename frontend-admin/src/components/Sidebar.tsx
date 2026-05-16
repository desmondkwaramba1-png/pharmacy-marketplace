import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/inventory', label: 'Inventory', icon: '💊' },
  { to: '/admin/reservations', label: 'Reservations', icon: '📋' },
  { to: '/admin/pickups', label: 'Pickup Portal', icon: '🏪' },
  { to: '/admin/profile', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)',
      color: '#fff',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #0284a8, #02C39A)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>💊</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', lineHeight: 1.1 }}>MediFind</div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
            }}>Admin Panel</div>
          </div>
        </div>

        {/* Pharmacy badge */}
        {user?.pharmacy?.name && (
          <div style={{
            marginTop: 14,
            padding: '8px 12px',
            background: 'rgba(2, 132, 168, 0.15)',
            borderRadius: 8,
            border: '1px solid rgba(2, 132, 168, 0.3)',
            fontSize: 12,
            color: '#7dd3fc',
            fontWeight: 500,
          }}>
            🏥 {user.pharmacy.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', padding: '0 8px', marginBottom: 8, textTransform: 'uppercase' }}>
          Navigation
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.15s',
              background: isActive ? 'linear-gradient(135deg, rgba(2,132,168,0.4), rgba(2,195,154,0.25))' : 'transparent',
              color: isActive ? '#7dd3fc' : 'rgba(255,255,255,0.7)',
              borderLeft: isActive ? '3px solid #0284a8' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || '—'}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(220,38,38,0.25)',
            color: '#fca5a5',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.15s',
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — display controlled by CSS (none on mobile, flex on 1024px+) */}
      <aside className="desktop-sidebar" style={{ padding: 0, overflow: 'hidden' }}>
        {sidebarContent}
      </aside>

      {/* Mobile hamburger — visually hidden on desktop via a style tag */}
      <button
        className="mobile-hamburger"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: 14,
          left: 16,
          zIndex: 200,
          background: 'linear-gradient(135deg, #0284a8, #02C39A)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(2,132,168,0.4)',
        }}
        aria-label="Open menu"
      >
        ☰
      </button>
      <style>{`
        @media (min-width: 1024px) {
          .mobile-hamburger { display: none !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            display: 'flex',
          }}
        >
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{
            position: 'relative',
            width: 260,
            height: '100%',
            flexShrink: 0,
            zIndex: 1,
          }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 16, right: -44,
                background: 'rgba(255,255,255,0.15)',
                border: 'none', color: '#fff', borderRadius: 8,
                width: 36, height: 36, fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
