import React, { useEffect, useRef, useState } from 'react';
import { FiBell, FiX, FiPackage, FiCreditCard, FiTruck } from 'react-icons/fi';
import { adminApi } from '../api/auth';
import { supabase } from '../api/supabaseClient';

interface Notification {
  id: string;
  pharmacy_id: string;
  order_id: string;
  booking_ref: string;
  message: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.is_read).length;

  // Load initial notifications and get pharmacyId for realtime sub
  useEffect(() => {
    let channel: any;

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const pid = user?.user_metadata?.pharmacyId;
        if (!pid) return;
        setPharmacyId(pid);

        const data = await adminApi.getNotifications();
        setNotifications(data);

        // Subscribe to new orders in realtime
        channel = adminApi.subscribeToNotifications(pid, (n: Notification) => {
          setNotifications(prev => [n, ...prev]);
          // Browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('New Order — MediFind', { body: n.message, icon: '/favicon.ico' });
          }
        });
      } catch (_) {}
    };

    init();
    return () => { channel?.unsubscribe(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unread > 0) {
      try {
        await adminApi.markNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (_) {}
    }
  };

  const payIcon = (method: string) =>
    method === 'online' ? <FiCreditCard size={12} /> : <FiPackage size={12} />;

  const deliveryLabel = (method: string) =>
    method === 'delivery' ? 'Delivery' : 'Pickup';

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        title="Order notifications"
      >
        <FiBell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: '#EF4444',
            color: '#fff',
            borderRadius: '50%',
            width: 16,
            height: 16,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          maxHeight: 480,
          overflowY: 'auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 10px',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            background: 'var(--color-surface)',
          }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Order Notifications</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}
            >
              <FiX size={16} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
              <FiBell size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>No orders yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                background: n.is_read ? 'transparent' : 'rgba(14,165,233,0.05)',
                transition: 'background 0.2s',
              }}>
                {/* Booking ref + time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5, color: 'var(--color-primary)' }}>
                    {n.booking_ref}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{timeAgo(n.created_at)}</span>
                </div>

                {/* Message */}
                <p style={{ fontSize: 13, margin: '0 0 6px', color: 'var(--color-text)' }}>{n.message}</p>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {/* Amount */}
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: '#DCFCE7', color: '#15803D',
                  }}>
                    ${Number(n.total_amount).toFixed(2)}
                  </span>

                  {/* Payment */}
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: n.payment_status === 'paid' ? '#DCFCE7' : '#FEF9C3',
                    color: n.payment_status === 'paid' ? '#15803D' : '#854D0E',
                  }}>
                    {payIcon(n.payment_method)}
                    {n.payment_status === 'paid' ? 'Paid online' : 'Pay at ' + deliveryLabel(n.delivery_method).toLowerCase()}
                  </span>

                  {/* Delivery */}
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: '#F0F9FF', color: '#0369A1',
                  }}>
                    <FiTruck size={11} />
                    {deliveryLabel(n.delivery_method)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
