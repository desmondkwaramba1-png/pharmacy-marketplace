import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/auth';
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
          <div className="stat-card">
            <div className="stat-icon"><FiBox color="var(--color-primary)" /></div>
            <div className="stat-value">{analytics?.totalMedicines ?? 0}</div>
            <div className="stat-label">Total Medicines</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FiSearch color="var(--color-primary)" /></div>
            <div className="stat-value">{analytics?.weeklySearches ?? 0}</div>
            <div className="stat-label">Searches This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FiMapPin color="var(--color-primary)" /></div>
            <div className="stat-value">{analytics?.directionRequests ?? 0}</div>
            <div className="stat-label">Directions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FiStar color="#F59E0B" /></div>
            <div className="stat-value">{analytics?.avgRating ?? '—'}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>

        {/* Inventory status bars */}
        <div className="info-section" style={{ marginTop: 16 }}>
          <div className="info-section-title">Inventory Status</div>
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
        <div className="info-section" style={{ marginTop: 16 }}>
          <div className="info-section-title">Quick Actions</div>
          <div className="quick-actions">
            <button
              id="add-medicine-btn"
              className="btn btn-primary btn-sm"
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
