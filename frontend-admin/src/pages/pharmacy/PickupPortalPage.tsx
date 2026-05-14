import React, { useState } from 'react';
import { adminApi } from '../../api/auth';
import { FiSearch, FiCheckCircle, FiXCircle, FiUser, FiPackage, FiCreditCard, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Order } from '../../types';

export default function PickupPortalPage() {
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wrongPharmacyMsg, setWrongPharmacyMsg] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bookingRefInput || bookingRefInput.length < 4) return;

    setIsLoading(true);
    setOrder(null);
    setWrongPharmacyMsg('');
    try {
      const data = await adminApi.getOrder(bookingRefInput);
      setOrder(data);
    } catch (err: any) {
      const msg: string = err.message || 'Booking not found';
      if (msg.startsWith('This order is not for your pharmacy')) {
        setWrongPharmacyMsg(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      const items = order.items?.map((item: any) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        pharmacyId: order.pharmacyId,
      }));
      await adminApi.collectOrder(order.bookingRef, items);
      toast.success('Pickup marked as collected! Inventory updated.');
      handleSearch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete pickup');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending:   { bg: '#E0F2FE', color: '#0369A1', label: 'Pending Pickup' },
      confirmed: { bg: '#E0F2FE', color: '#0369A1', label: 'Confirmed' },
      collected: { bg: '#DCFCE7', color: '#15803D', label: 'Collected' },
      expired:   { bg: '#FEE2E2', color: '#B91C1C', label: 'Expired' },
    };
    const s = styles[status] || styles.expired;
    return (
      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Order Pickup Portal</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Enter the customer's confirmation code to process their reservation.
        </p>

        <div className="pickup-layout">
          {/* Left: search + hints */}
          <div className="pickup-search-panel">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
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

            {/* Wrong pharmacy warning */}
            {wrongPharmacyMsg && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FB923C', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#C2410C', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiXCircle /> Wrong Pharmacy
                </div>
                {wrongPharmacyMsg.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#92400E', marginTop: i === 0 ? 0 : 6 }}>{line}</div>
                ))}
              </div>
            )}

            {/* How it works hint */}
            {!order && !wrongPharmacyMsg && !isLoading && (
              <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: 20, border: '1px dashed var(--color-border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>How to process a pickup:</div>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  <li>Ask the customer for their confirmation code (e.g. <strong>MF-X7Y2</strong>)</li>
                  <li>Enter the code above and click <strong>Search</strong></li>
                  <li>Verify their identity and collect payment if unpaid</li>
                  <li>Click <strong>Complete Sale &amp; Pickup</strong> to mark as collected</li>
                </ol>
              </div>
            )}
          </div>

          {/* Right: order details */}
          <div className="pickup-result-panel">
            {order ? (
              <div className="medicine-card" style={{ cursor: 'default', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{order.bookingRef}</div>
                    {(order as any).pharmacy?.name && (
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', marginTop: 2 }}>
                        {(order as any).pharmacy.name}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Reserved on {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Customer</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
                      <FiUser /> {order.userId ? 'Authenticated Patient' : 'Guest Customer'}
                    </div>
                  </div>
                  <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Total to Collect</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>${Number(order.totalAmount).toFixed(2)}</div>
                  </div>
                </div>

                {/* Payment & delivery badges */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {(order as any).paymentStatus === 'paid' ? (
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCreditCard size={11} /> Paid online — no payment needed
                    </span>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#FEF9C3', color: '#854D0E', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCreditCard size={11} /> Collect payment at {(order as any).deliveryMethod === 'delivery' ? 'delivery' : 'pickup'}
                    </span>
                  )}
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#F0F9FF', color: '#0369A1', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiTruck size={11} /> {(order as any).deliveryMethod === 'delivery' ? 'Home delivery' : 'In-store pickup'}
                  </span>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiPackage /> Reserved Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {order.items?.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{item.medicine?.genericName}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                            {item.medicine?.brandName} {item.medicine?.dosage ? `(${item.medicine.dosage})` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600 }}>qty: {item.quantity}</div>
                          <div style={{ fontSize: 11 }}>${Number(item.priceAtBooking).toFixed(2)} ea</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'pending' || order.status === 'confirmed' ? (
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
            ) : !isLoading && !wrongPharmacyMsg && (
              <div className="empty-state" style={{ marginTop: 0, minHeight: 200 }}>
                <div className="empty-state-icon"><FiPackage /></div>
                <p>Enter a booking code to view order details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
