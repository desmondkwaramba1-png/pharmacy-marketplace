import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../../api/cart';
import { FiChevronLeft, FiClock, FiTruck, FiPackage, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { FaClinicMedical } from 'react-icons/fa';
import { Order } from '../../types';

export default function MyReservationsPage() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: cartApi.getOrders,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
          <h1 className="app-header-title">My Orders</h1>
        </header>
        <div className="page-content">
          <div className="empty-state">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header style={{
        background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(2,132,168,0.12)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0284a8', flexShrink: 0 }}>
          <FiChevronLeft size={20} />
        </button>
        <h1 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>My Reservations</h1>
      </header>

      <div className="page-content">
        {(!orders || orders.length === 0) ? (
          <div className="empty-state">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32, color: '#fff' }}>💊</div>
            <div className="empty-state-title">No orders yet</div>
            <p>Your medicine orders will appear here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
              Browse Medicines
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  pending:          { color: '#D97706', bg: '#fef3c7',  label: 'Pending',          emoji: '⏳' },
  confirmed:        { color: '#059669', bg: '#d1fae5',  label: 'Confirmed',        emoji: '✅' },
  out_for_delivery: { color: '#7C3AED', bg: '#ede9fe',  label: 'Out for Delivery', emoji: '🚚' },
  delivered:        { color: '#059669', bg: '#d1fae5',  label: 'Delivered',        emoji: '📦' },
  collected:        { color: '#059669', bg: '#d1fae5',  label: 'Collected',        emoji: '🎉' },
  expired:          { color: '#dc2626', bg: '#fee2e2',  label: 'Expired',          emoji: '❌' },
  cancelled:        { color: '#64748b', bg: '#f1f5f9',  label: 'Cancelled',        emoji: '🚫' },
};

function OrderCard({ order }: { order: Order }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);

  useEffect(() => {
    if (order.status !== 'pending') return;
    const timer = setInterval(() => {
      const distance = new Date(order.expiresAt).getTime() - Date.now();
      if (distance < 0) {
        setTimeLeft('Expired');
        setIsExpiredLocally(true);
        clearInterval(timer);
      } else {
        const m = Math.floor((distance % 3600000) / 60000);
        const s = Math.floor((distance % 60000) / 1000);
        setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const cfg = STATUS_CONFIG[order.status] ?? { color: '#64748b', bg: '#f1f5f9', label: order.status, emoji: '❓' };
  const isDelivery = order.deliveryMethod === 'delivery';
  const isPaidOnline = order.paymentMethod === 'online';

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderLeft: `3px solid ${cfg.color}`, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 16, cursor: 'default' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FaClinicMedical color={cfg.color} size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{order.pharmacy?.name}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', marginLeft: 8 }}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{order.pharmacy?.address}</div>
        </div>
      </div>

      {/* Badges: delivery & payment method */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
          background: isDelivery ? '#ede9fe' : '#f0fdf4',
          color: isDelivery ? '#7c3aed' : '#16a34a'
        }}>
          {isDelivery ? <FiTruck size={11} /> : <FiPackage size={11} />}
          {isDelivery ? 'Delivery' : 'Pickup'}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
          background: isPaidOnline ? '#f0f7ff' : '#fefce8',
          color: isPaidOnline ? '#1d4ed8' : '#a16207'
        }}>
          {isPaidOnline ? <FiCreditCard size={11} /> : <FiDollarSign size={11} />}
          {isPaidOnline
            ? (order.paymentStatus === 'paid' ? 'Paid Online' : 'Payment Pending')
            : (isDelivery ? 'Pay on Delivery' : 'Pay at Pharmacy')}
        </span>
      </div>

      {/* Booking code */}
      <div style={{ margin: '12px 0', padding: 12, background: 'var(--color-bg)', borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {isDelivery ? 'Order Reference' : 'Pickup Code'}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', letterSpacing: 2, margin: '4px 0' }}>
          {order.bookingRef}
        </div>
        {order.status === 'pending' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: isExpiredLocally ? '#fee2e2' : '#e0f2fe', color: isExpiredLocally ? '#dc2626' : '#0284a8', marginTop: 6 }}>
            <FiClock size={12} /> {timeLeft}
          </div>
        )}
      </div>

      {/* Delivery address */}
      {isDelivery && order.deliveryAddress && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 8, marginBottom: 8 }}>
          📍 Deliver to: <strong style={{ color: 'var(--color-text)' }}>{order.deliveryAddress}</strong>
        </div>
      )}

      {/* Items & total */}
      <div className="card-status-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Items:</div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {order.items?.map(i => i.medicine?.genericName).join(', ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {isPaidOnline && order.paymentStatus === 'paid' ? 'Paid:' : 'Total:'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0284a8' }}>
            ${order.totalAmount?.toFixed(2)}
          </div>
          {isDelivery && order.deliveryFee > 0 && (
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              incl. ${order.deliveryFee.toFixed(2)} delivery
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
