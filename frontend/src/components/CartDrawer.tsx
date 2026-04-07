import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { FiX, FiClock, FiTrash2, FiShoppingBag, FiInfo, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, checkout } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; bookingRef: string; pharmacyName?: string } | null>(null);

  const groups = useMemo(() => {
    if (!cart?.items) return [];
    const map = new Map();
    cart.items.forEach(item => {
      const pId = item.pharmacyId;
      if (!map.has(pId)) map.set(pId, { id: pId, name: item.pharmacy?.name, items: [], total: 0 });
      const g = map.get(pId);
      g.items.push(item);
      g.total += Number(item.price || 0) * item.quantity;
    });
    return Array.from(map.values());
  }, [cart]);

  if (!isCartOpen) return null;

  const handleCheckout = async (pharmacyId: string, pharmacyName: string) => {
    setIsCheckingOut(pharmacyId);
    try {
      const data = await checkout(pharmacyId);
      setSuccessData({ ...data, pharmacyName });
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(null);
    }
  };

  const closeDrawer = () => {
    setCartOpen(false);
    setTimeout(() => setSuccessData(null), 300);
  };

  return (
    <>
      <div className="modal-overlay" onClick={closeDrawer} style={{ zIndex: 1000 }} />
      <div 
        className="app-drawer"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '400px',
          background: 'var(--color-surface)', zIndex: 1001, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiShoppingBag color="var(--color-primary)" /> Cart & Bookings
          </h2>
          <button className="btn-icon" onClick={closeDrawer}><FiX /></button>
        </div>

        {successData ? (
          <div style={{ flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 64, color: 'var(--color-primary)', marginBottom: 20 }}><FiCheckCircle /></div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Go to <strong>{successData.pharmacyName}</strong> within 10 minutes and show this code:
            </p>
            <div style={{ background: 'var(--color-bg)', padding: '16px 32px', borderRadius: 12, border: '1px dashed var(--color-primary)', marginBottom: 32 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2, color: 'var(--color-text)' }}>{successData.bookingRef}</span>
            </div>
            <button className="btn btn-primary btn-full" onClick={closeDrawer}>Done</button>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {groups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiShoppingBag /></div>
                <div className="empty-state-text">Your cart is empty</div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                  Find a medicine to reserve it for 10 minutes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '8px' }}>
                  <FiInfo style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Confirm each pharmacy separately to receive your pickup codes.</span>
                </div>

                {groups.map((group) => (
                  <div key={group.id} className="pharmacy-cart-group" style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-bg)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>
                      {group.name}
                    </div>
                    <div style={{ padding: '0 16px' }}>
                      {group.items.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{item.medicine?.genericName}</div>
                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 12, color: item.isExpired ? 'var(--color-error)' : 'var(--color-warning)' }}>
                                <FiClock /> 
                                {item.isExpired ? 'Expired' : `${Math.floor(item.remainingSeconds / 60)}:${(item.remainingSeconds % 60).toString().padStart(2, '0')}`}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600 }}>${Number(item.price).toFixed(2)}</span>
                                <button className="btn-icon" onClick={() => removeFromCart(item.id)} style={{ padding: 4 }}>
                                  <FiTrash2 size={14} color="var(--color-text-disabled)" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 700 }}>
                        <span>Total:</span>
                        <span>${group.total.toFixed(2)}</span>
                      </div>
                      <button 
                        className="btn btn-primary btn-full" 
                        onClick={() => handleCheckout(group.id, group.name)}
                        disabled={!!isCheckingOut || group.items.some((i: any) => i.isExpired)}
                        style={{ height: 42 }}
                      >
                        {isCheckingOut === group.id ? 'Booking...' : 'Book Items & Get Code →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
