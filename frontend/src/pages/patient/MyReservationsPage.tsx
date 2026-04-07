import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cart';
import { FiChevronLeft, FiClock, FiCheckCircle, FiXCircle, FiShoppingBag } from 'react-icons/fi';
import { FaClinicMedical } from 'react-icons/fa';

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: cartApi.getOrders,
    refetchInterval: 10000, // Sync status every 10s
  });

  if (isLoading) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
          <h1 className="app-header-title">My Reservations</h1>
        </header>
        <div className="page-content">
          <div className="empty-state">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
        <h1 className="app-header-title">My Reservations</h1>
      </header>

      <div className="page-content">
        {(!orders || orders.length === 0) ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiShoppingBag /></div>
            <div className="empty-state-title">No reservations yet</div>
            <p>Your medicine bookings will appear here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
              Browse Medicines
            </button>
          </div>
        ) : (
          <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);

  useEffect(() => {
    if (order.status !== 'pending') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(order.expires_at).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        setIsExpiredLocally(true);
        clearInterval(timer);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const statusColors: any = {
    pending: 'var(--color-primary)',
    collected: 'var(--color-success)',
    expired: 'var(--color-error)',
    cancelled: 'var(--color-text-secondary)',
  };

  return (
    <div className="medicine-card" style={{ cursor: 'default' }}>
      <div className="medicine-card-header">
        <div className="medicine-icon">
          <FaClinicMedical color={statusColors[order.status] || 'var(--color-text)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="medicine-name">{order.pharmacy?.name}</div>
            <div 
              style={{ 
                fontSize: 10, 
                fontWeight: 700, 
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 4,
                background: `${statusColors[order.status]}20`,
                color: statusColors[order.status]
              }}
            >
              {order.status}
            </div>
          </div>
          <div className="medicine-meta">{order.pharmacy?.address}</div>
        </div>
      </div>

      <div style={{ margin: '12px 0', padding: 12, background: 'var(--color-bg)', borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Confirmation Code
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', letterSpacing: 2, margin: '4px 0' }}>
          {order.booking_ref}
        </div>
        {order.status === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: isExpiredLocally ? 'var(--color-error)' : 'var(--color-primary)', fontWeight: 600 }}>
            <FiClock /> {timeLeft}
          </div>
        )}
      </div>

      <div className="card-status-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Items:</div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {order.items?.map((i: any) => i.medicine?.generic_name).join(', ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>To pay:</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>${order.total_amount}</div>
        </div>
      </div>
    </div>
  );
}
