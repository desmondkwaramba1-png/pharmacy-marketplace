import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FiX, FiClock, FiTrash2, FiShoppingBag, FiInfo, FiCheckCircle } from 'react-icons/fi';

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, checkout } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; bookingRef: string } | null>(null);

  if (!isCartOpen) return null;

  const total = cart?.total || 0;
  const items = cart?.items || [];

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const data = await checkout();
      setSuccessData(data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const closeDrawer = () => {
    setCartOpen(false);
    // Let animation finish before clearing success state
    setTimeout(() => setSuccessData(null), 300);
  };

  return (
    <>
      <div className="modal-overlay" onClick={closeDrawer} style={{ zIndex: 1000 }} />
      <div 
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '400px',
          background: 'var(--color-surface)', zIndex: 1001, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiShoppingBag color="var(--color-primary)" /> My Reserved Medicines
          </h2>
          <button className="btn-icon" onClick={closeDrawer}><FiX /></button>
        </div>

        {successData ? (
          <div style={{ flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 64, color: 'var(--color-primary)', marginBottom: 20 }}><FiCheckCircle /></div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Show this reference number at the pharmacy to collect your order.
            </p>
            <div style={{ background: 'var(--color-bg)', padding: '16px 32px', borderRadius: 12, border: '1px dashed var(--color-primary)', marginBottom: 32 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Booking Ref</span>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2, color: 'var(--color-text)' }}>{successData.bookingRef}</span>
            </div>
            <button className="btn btn-primary btn-full" onClick={closeDrawer}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {items.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FiShoppingBag /></div>
                  <div className="empty-state-text">Your cart is empty [Syncing V3]</div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                    Medicines you add to your cart are reserved for 10 minutes to allow you to get to the pharmacy.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                    <FiInfo style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Reserved items will automatically return to the global inventory if not checked out before the timer expires.</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                        {item.medicine?.imageUrl && (
                          <img src={item.medicine.imageUrl} alt="" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{item.medicine?.genericName}</div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.pharmacy?.name}</div>
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: item.isExpired ? 'var(--color-error)' : 'var(--color-warning)' }}>
                              <FiClock /> 
                              {item.isExpired ? 'Expired' : `${Math.floor(item.remainingSeconds / 60)}:${(item.remainingSeconds % 60).toString().padStart(2, '0')}`}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>${(item.price || 0).toFixed(2)}</span>
                              <button className="btn-icon" style={{ width: 32, height: 32, fontSize: 16, color: 'var(--color-text-secondary)' }} onClick={() => removeFromCart(item.id)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
                  <span>Total Reservation:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary btn-full" 
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.some(i => i.isExpired)}
                >
                  {isCheckingOut ? 'Confirming...' : 'Confirm & Book'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
