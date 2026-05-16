import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import type { AdminAnalytics } from '../../types';
import { FiBox, FiSearch, FiMapPin, FiStar, FiCheckCircle, FiAlertTriangle, FiXCircle, FiPlus, FiEdit2 } from 'react-icons/fi';
import { FaHandSparkles, FaClinicMedical } from 'react-icons/fa';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.getAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  const total = analytics ? analytics.inStock + analytics.lowStock + analytics.outOfStock : 1;
  const inStockPct = analytics ? Math.round((analytics.inStock / total) * 100) : 0;
  const lowPct = analytics ? Math.round((analytics.lowStock / total) * 100) : 0;
  const outPct = analytics ? Math.round((analytics.outOfStock / total) * 100) : 0;

  const now = new Date().toLocaleString('en-ZW', { dateStyle: 'medium', timeStyle: 'short' });

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-content" style={{ paddingTop: 16 }}><SkeletonList count={4} /></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 12 }}>
        {/* Welcome & Pharmacy Name */}
        <div className="admin-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="admin-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Welcome, {user?.firstName || user?.email?.split('@')[0]}! <FaHandSparkles color="#FCD34D" />
            </div>
            <div className="admin-welcome-sub">Managing: <strong style={{ color: 'var(--color-primary)' }}>{user?.pharmacy?.name || 'Assigned Pharmacy'}</strong></div>
          </div>
          <div className="admin-welcome-sub" style={{ fontSize: 11, textAlign: 'right' }}>{now}</div>
        </div>

        {/* Stats grid */}
        <div className="stats-grid" style={{ marginTop: 16 }}>
          <div className="stat-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(2,132,168,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><FiBox color="#fff" size={20} /></div>
            <div className="stat-value" style={{ color: '#0f172a', fontWeight: 800 }}>{analytics?.totalMedicines ?? 0}</div>
            <div className="stat-label" style={{ color: '#64748b' }}>Total Medicines</div>
          </div>
          <div className="stat-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(124,58,237,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><FiSearch color="#fff" size={20} /></div>
            <div className="stat-value" style={{ color: '#0f172a', fontWeight: 800 }}>{analytics?.weeklySearches ?? 0}</div>
            <div className="stat-label" style={{ color: '#64748b' }}>Searches This Week</div>
          </div>
          <div className="stat-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(5,150,105,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><FiMapPin color="#fff" size={20} /></div>
            <div className="stat-value" style={{ color: '#0f172a', fontWeight: 800 }}>{analytics?.directionRequests ?? 0}</div>
            <div className="stat-label" style={{ color: '#64748b' }}>Directions</div>
          </div>
          <div className="stat-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(217,119,6,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #D97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><FiStar color="#fff" size={20} /></div>
            <div className="stat-value" style={{ color: '#0f172a', fontWeight: 800 }}>{analytics?.avgRating ?? '—'}</div>
            <div className="stat-label" style={{ color: '#64748b' }}>Avg Rating</div>
          </div>
        </div>

        {/* Inventory status bars */}
        <div className="info-section" style={{ marginTop: 16, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', marginBottom: 4 }}>Overview</div>
          <div className="info-section-title" style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>Inventory Status</div>
          <div className="inventory-status-bars" style={{ padding: 0 }}>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiCheckCircle color="var(--color-success)" /> In Stock: {analytics?.inStock ?? 0}</span>
                <span style={{ color: 'var(--color-success)' }}>{inStockPct}%</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill success" style={{ width: `${inStockPct}%` }} />
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiAlertTriangle color="var(--color-warning)" /> Low Stock: {analytics?.lowStock ?? 0}</span>
                <span style={{ color: 'var(--color-warning)' }}>{lowPct}%</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill warning" style={{ width: `${lowPct}%` }} />
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiXCircle color="var(--color-error)" /> Out of Stock: {analytics?.outOfStock ?? 0}</span>
                <span style={{ color: 'var(--color-error)' }}>{outPct}%</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill error" style={{ width: `${outPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="info-section" style={{ marginTop: 16, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', marginBottom: 4 }}>Actions</div>
          <div className="info-section-title" style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>Quick Actions</div>
          <div className="quick-actions">
            <button
              id="add-medicine-btn"
              style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => navigate('/admin/inventory?action=add')}
            >
              <FiPlus /> Add Medicine
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/inventory')}
            >
              <FiBox /> Manage Inventory
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/profile')}
            >
              <FaClinicMedical /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
