import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../../api/cart';
import {
  FiChevronLeft, FiClock, FiTruck, FiPackage,
  FiCreditCard, FiDollarSign, FiShoppingBag,
} from 'react-icons/fi';
import { FaClinicMedical } from 'react-icons/fa';
import type { Order, OrderStatus } from '../../types';

type TabFilter = 'all' | 'active' | 'completed' | 'expired';

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'out_for_delivery'];
const COMPLETED_STATUSES: OrderStatus[] = ['delivered', 'collected'];
const EXPIRED_STATUSES: OrderStatus[] = ['expired', 'cancelled'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  pending:          { color: '#D97706', bg: '#fef3c7', border: '#D97706', label: 'Pending',          emoji: '⏳' },
  confirmed:        { color: '#059669', bg: '#d1fae5', border: '#059669', label: 'Confirmed',        emoji: '✅' },
  out_for_delivery: { color: '#7C3AED', bg: '#ede9fe', border: '#7C3AED', label: 'Out for Delivery', emoji: '🚚' },
  delivered:        { color: '#059669', bg: '#d1fae5', border: '#059669', label: 'Delivered',        emoji: '📦' },
  collected:        { color: '#059669', bg: '#d1fae5', border: '#059669', label: 'Collected',        emoji: '🎉' },
  expired:          { color: '#dc2626', bg: '#fee2e2', border: '#dc2626', label: 'Expired',          emoji: '❌' },
  cancelled:        { color: '#64748b', bg: '#f1f5f9', border: '#94a3b8', label: 'Cancelled',        emoji: '🚫' },
};

const TAB_ITEMS: { key: TabFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired',   label: 'Expired' },
];

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: cartApi.getOrders,
    refetchInterval: 30000,
  });

  const filteredOrders = (orders || []).filter((order: Order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ACTIVE_STATUSES.includes(order.status);
    if (activeTab === 'completed') return COMPLETED_STATUSES.includes(order.status);
    if (activeTab === 'expired') return EXPIRED_STATUSES.includes(order.status);
    return true;
  });

  // Sort: active orders first, then by createdAt desc
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aActive = ACTIVE_STATUSES.includes(a.status) ? 0 : 1;
    const bActive = ACTIVE_STATUSES.includes(b.status) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="page">
      <style>{`
        .mrp-tab { border: none; background: none; padding: 8px 16px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all 0.15s; white-space: nowrap; }
        .mrp-tab.active { color: #0284a8; border-bottom-color: #0284a8; }
        .mrp-tab:hover:not(.active) { color: #0f172a; }
      `}</style>

      {/* Teal gradient sticky header */}
      <header style={{
        background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(2,132,168,0.12)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0284a8', flexShrink: 0 }}
        >
          <FiChevronLeft size={20} />
        </button>
        <h1 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>My Reservations</h1>
        {orders && orders.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.8)', color: '#0284a8', border: '1px solid rgba(2,132,168,0.2)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        )}
      </header>

      {/* Tab filter */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', position: 'sticky', top: 64, zIndex: 99 }}>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            className={`mrp-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && orders && (
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: activeTab === tab.key ? '#e0f2fe' : '#f1f5f9', color: activeTab === tab.key ? '#0284a8' : '#94a3b8' }}>
                {orders.filter((o: Order) => {
                  if (tab.key === 'active') return ACTIVE_STATUSES.includes(o.status);
                  if (tab.key === 'completed') return COMPLETED_STATUSES.includes(o.status);
                  if (tab.key === 'expired') return EXPIRED_STATUSES.includes(o.status);
                  return false;
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="page-content">
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}>
              <FiShoppingBag color="#fff" size={24} />
            </div>
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
            <p style={{ color: '#64748b', fontWeight: 500 }}>Loading your orders...</p>
          </div>
        )}

        {!isLoading && sortedOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>
              💊
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              {activeTab === 'all' ? 'Your medicine reservations will appear here.' : `You have no ${activeTab} orders.`}
            </p>
            <button
              style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.35)' }}
              onClick={() => navigate('/')}
            >
              Browse Medicines
            </button>
          </div>
        )}

        {!isLoading && sortedOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sortedOrders.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);

  useEffect(() => {
    if (order.status !== 'pending') return;
    const tick = () => {
      const distance = new Date(order.expiresAt).getTime() - Date.now();
      if (distance < 0) {
        setTimeLeft('Expired');
        setIsExpiredLocally(true);
      } else {
        const m = Math.floor((distance % 3600000) / 60000);
        const s = Math.floor((distance % 60000) / 1000);
        setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const cfg = STATUS_CONFIG[order.status] ?? { color: '#64748b', bg: '#f1f5f9', border: '#94a3b8', label: order.status, emoji: '❓' };
  const isDelivery  = order.deliveryMethod === 'delivery';
  const isPaidOnline = order.paymentMethod === 'online';
  const isActive = ACTIVE_STATUSES.includes(order.status);

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e2e8f0',
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: 16,
      boxShadow: isActive ? `0 4px 20px ${cfg.color}20` : '0 2px 8px rgba(0,0,0,0.05)',
      padding: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
          {cfg.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{order.pharmacy?.name}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', marginLeft: 8 }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{order.pharmacy?.address}</div>
        </div>
      </div>

      {/* Delivery & payment badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: isDelivery ? '#ede9fe' : '#f0fdf4', color: isDelivery ? '#7c3aed' : '#16a34a' }}>
          {isDelivery ? <FiTruck size={11} /> : <FiPackage size={11} />}
          {isDelivery ? 'Delivery' : 'Pickup'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: isPaidOnline ? '#f0f7ff' : '#fefce8', color: isPaidOnline ? '#1d4ed8' : '#a16207' }}>
          {isPaidOnline ? <FiCreditCard size={11} /> : <FiDollarSign size={11} />}
          {isPaidOnline
            ? (order.paymentStatus === 'paid' ? 'Paid Online' : 'Payment Pending')
            : (isDelivery ? 'Pay on Delivery' : 'Pay at Pharmacy')}
        </span>
      </div>

      {/* Booking reference */}
      <div style={{ margin: '12px 0', padding: '14px 12px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
          {isDelivery ? 'Order Reference' : 'Pickup Code'}
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '4px', fontFamily: 'monospace' }}>
          {order.bookingRef}
        </div>
        {order.status === 'pending' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
            background: isExpiredLocally ? '#fee2e2' : '#e0f2fe',
            color: isExpiredLocally ? '#dc2626' : '#0284a8',
            marginTop: 8, border: `1px solid ${isExpiredLocally ? '#fecaca' : '#bae6fd'}`,
          }}>
            <FiClock size={13} /> {timeLeft}
          </div>
        )}
      </div>

      {/* Delivery address */}
      {isDelivery && order.deliveryAddress && (
        <div style={{ fontSize: 12, color: '#475569', padding: '8px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 12, border: '1px solid #e2e8f0' }}>
          📍 Deliver to: <strong style={{ color: '#0f172a' }}>{order.deliveryAddress}</strong>
        </div>
      )}

      {/* Items & total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Items</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', lineHeight: 1.4 }}>
            {order.items?.map((i) => i.medicine?.genericName).filter(Boolean).join(', ') || 'No items'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
            {isPaidOnline && order.paymentStatus === 'paid' ? 'Paid' : 'Total'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0284a8' }}>${order.totalAmount?.toFixed(2)}</div>
          {isDelivery && order.deliveryFee > 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8' }}>incl. ${order.deliveryFee.toFixed(2)} delivery</div>
          )}
        </div>
      </div>
    </div>
  );
}
