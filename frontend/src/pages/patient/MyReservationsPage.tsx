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
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /></button>
        <h1 className="app-header-title">My Orders</h1>
      </header>

      <div className="page-content">
        {(!orders || orders.length === 0) ? (
          <div className="empty-state">
            <div className="empty-state-icon">💊</div>
            <div className="empty-state-title">No orders yet</div>
            <p>Your medicine orders will appear here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/home')} style={{ marginTop: 20 }}>
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

const STATUS_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  pending:          { color: 'var(--color-primary)',        label: 'Pending',          emoji: '⏳' },
  confirmed:        { color: '#0891b2',                     label: 'Confirmed',        emoji: '✅' },
  out_for_delivery: { color: '#7c3aed',                     label: 'Out for Delivery', emoji: '🚚' },
  delivered:        { color: 'var(--color-success)',        label: 'Delivered',        emoji: '📦' },
  collected:        { color: 'var(--color-success)',        label: 'Collected',        emoji: '🎉' },
  expired:          { color: 'var(--color-error)',          label: 'Expired',          emoji: '❌' },
  cancelled:        { color: 'var(--color-text-secondary)', label: 'Cancelled',        emoji: '🚫' },
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

  const cfg = STATUS_CONFIG[order.status] ?? { color: 'var(--color-text)', label: order.status, emoji: '❓' };
  const isDelivery = order.deliveryMethod === 'delivery';
  const isPaidOnline = order.paymentMethod === 'online';

  return (
    <div className="medicine-card" style={{ cursor: 'default' }}>
      {/* Header */}
      <div className="medicine-card-header">
        <div className="medicine-icon">
          <FaClinicMedical color={cfg.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="medicine-name">{order.pharmacy?.name}</div>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 4,
              background: `${cfg.color}20`, color: cfg.color
            }}>
              {cfg.emoji} {cfg.label}
            </div>
          </div>
          <div className="medicine-meta">{order.pharmacy?.address}</div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: isExpiredLocally ? 'var(--color-error)' : 'var(--color-primary)', fontWeight: 600 }}>
            <FiClock /> {timeLeft}
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
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
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
