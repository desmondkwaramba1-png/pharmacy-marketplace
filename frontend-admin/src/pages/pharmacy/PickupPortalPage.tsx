import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/auth';
import { FiSearch, FiCheckCircle, FiXCircle, FiClock, FiUser, FiPackage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Order } from '../../types';

export default function PickupPortalPage() {
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bookingRefInput || bookingRefInput.length < 4) return;

    setIsLoading(true);
    setOrder(null);
    try {
      const data = await adminApi.getOrder(bookingRefInput);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message || 'Booking not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!order) return;
    
    setIsProcessing(true);
    try {
      await adminApi.collectOrder(order.bookingRef);
      toast.success('Pickup marked as collected!');
      // Refresh order status
      handleSearch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete pickup');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: { bg: '#E0F2FE', color: '#0369A1', label: 'Pending Pickup' },
      collected: { bg: '#DCFCE7', color: '#15803D', label: 'Collected' },
      expired: { bg: '#FEE2E2', color: '#B91C1C', label: 'Expired' },
    };
    const s = styles[status] || styles.expired;
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: 20, 
        fontSize: 12, 
        fontWeight: 600, 
        background: s.bg, 
        color: s.color 
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Order Pickup Portal</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Enter the customer's 6-digit confirmation code to process their reservation.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MF-X7Y2"
              value={bookingRefInput}
              onChange={(e) => setBookingRefInput(e.target.value.toUpperCase())}
              style={{ paddingLeft: 44, textTransform: 'uppercase', letterSpacing: 1 }}
              maxLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {order ? (
          <div className="medicine-card" style={{ cursor: 'default', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{order.bookingRef}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Reserved on {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Customer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                  <FiUser /> {order.userId ? 'Authenticated Patient' : 'Guest Customer'}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Total to Collect</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>${order.totalAmount}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiPackage /> Reserved Items
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.medicine?.genericName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.medicine?.brandName} ({item.medicine?.dosage})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>qty: {item.quantity}</div>
                      <div style={{ fontSize: 11 }}>${item.priceAtBooking} ea</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'pending' ? (
              <button 
                className="btn btn-primary btn-full" 
                onClick={handleCompletePickup}
                disabled={isProcessing}
                style={{ height: 48, fontSize: 16 }}
              >
                {isProcessing ? 'Processing...' : 'Complete Sale & Pickup'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, background: 'var(--color-bg)', borderRadius: 8, color: 'var(--color-text-secondary)' }}>
                {order.status === 'collected' ? (
                  <><FiCheckCircle color="var(--color-success)" /> This order has already been picked up.</>
                ) : (
                  <><FiXCircle color="var(--color-error)" /> This reservation has expired.</>
                )}
              </div>
            )}
          </div>
        ) : !isLoading && (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state-icon"><FiPackage /></div>
            <p>Enter a booking code to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
