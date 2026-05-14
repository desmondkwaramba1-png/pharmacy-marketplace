import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import {
  FiX, FiClock, FiTrash2, FiShoppingBag, FiInfo, FiCheckCircle,
  FiTruck, FiMapPin, FiCreditCard, FiDollarSign, FiArrowLeft, FiPackage
} from 'react-icons/fi';
import { CheckoutOptions, DeliveryMethod, PaymentMethod } from '../types';

type Step = 'cart' | 'fulfillment' | 'delivery-address' | 'payment-method' | 'card-details' | 'processing' | 'success';

interface CheckoutState {
  pharmacyId: string;
  pharmacyName: string;
  groupTotal: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryNotes: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const DELIVERY_FEE = 5.00;

function formatCard(val: string) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val: string) {
  // Strip everything except digits and slashes, keep only digits
  const digits = val.replace(/\D/g, '').substring(0, 4);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.substring(0, 2)}/${digits.substring(2)}`;
}

function cardDigits(val: string) {
  return val.replace(/\s/g, '').replace(/\D/g, '');
}

function isCardReady(cardNumber: string, cardExpiry: string, cardCvc: string) {
  return cardDigits(cardNumber).length >= 13 &&
    cardExpiry.includes('/') && cardExpiry.length >= 4 &&
    cardCvc.length >= 3;
}

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, checkout } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [state, setState] = useState<CheckoutState>({
    pharmacyId: '', pharmacyName: '', groupTotal: 0,
    deliveryMethod: 'pickup', paymentMethod: 'in_person',
    deliveryAddress: '', deliveryNotes: '',
    cardNumber: '', cardExpiry: '', cardCvc: '', cardName: ''
  });
  const [successData, setSuccessData] = useState<{
    message: string; bookingRef: string; pharmacyName: string;
    deliveryMethod: DeliveryMethod; paymentMethod: PaymentMethod;
    deliveryAddress?: string; transactionId?: string; total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    if (!cart?.items) return [];
    const map = new Map<string, { id: string; name: string; items: any[]; subtotal: number }>();
    cart.items.forEach(item => {
      const pId = item.pharmacyId;
      if (!map.has(pId)) map.set(pId, { id: pId, name: item.pharmacy?.name ?? '', items: [], subtotal: 0 });
      const g = map.get(pId)!;
      g.items.push(item);
      g.subtotal += Number(item.price || 0) * item.quantity;
    });
    return Array.from(map.values());
  }, [cart]);

  if (!isCartOpen) return null;

  const closeDrawer = () => {
    setCartOpen(false);
    setTimeout(() => { setStep('cart'); setSuccessData(null); setError(null); }, 300);
  };

  const startCheckout = (pharmacyId: string, pharmacyName: string, groupTotal: number) => {
    setState(s => ({ ...s, pharmacyId, pharmacyName, groupTotal }));
    setError(null);
    setStep('fulfillment');
  };

  const grandTotal = state.deliveryMethod === 'delivery'
    ? state.groupTotal + DELIVERY_FEE
    : state.groupTotal;

  const handleFinalCheckout = async () => {
    setError(null);
    setStep('processing');
    const options: CheckoutOptions = {
      paymentMethod: state.paymentMethod,
      deliveryMethod: state.deliveryMethod,
      deliveryAddress: state.deliveryAddress || undefined,
      deliveryNotes: state.deliveryNotes || undefined,
      cardNumber: state.cardNumber.replace(/\s/g, '') || undefined,
      cardExpiry: state.cardExpiry || undefined,
      cardCvc: state.cardCvc || undefined,
    };
    try {
      const data = await checkout(state.pharmacyId, options);
      setSuccessData({
        ...data,
        pharmacyName: state.pharmacyName,
        deliveryMethod: state.deliveryMethod,
        paymentMethod: state.paymentMethod,
        deliveryAddress: state.deliveryAddress,
        total: grandTotal,
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
      setStep(state.paymentMethod === 'online' ? 'card-details' : 'payment-method');
    }
  };

  const back = () => {
    setError(null);
    if (step === 'fulfillment') setStep('cart');
    else if (step === 'delivery-address') setStep('fulfillment');
    else if (step === 'payment-method') setStep(state.deliveryMethod === 'delivery' ? 'delivery-address' : 'fulfillment');
    else if (step === 'card-details') setStep('payment-method');
  };

  return (
    <>
      <div className="modal-overlay" onClick={closeDrawer} style={{ zIndex: 1000 }} />
      <div
        className="app-drawer"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '420px',
          background: 'var(--color-surface)', zIndex: 1001, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #014d5e 60%, #01697a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {step !== 'cart' && step !== 'success' && step !== 'processing' ? (
            <button onClick={back} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><FiArrowLeft size={16} /></button>
          ) : (
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, letterSpacing: '-0.02em' }}>
              <FiShoppingBag color="#02C39A" size={20} />
              {step === 'success' ? 'Order Confirmed' : 'Your Cart'}
            </h2>
          )}
          {step !== 'cart' && step !== 'success' && step !== 'processing' && (
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
              {step === 'fulfillment' ? 'Fulfillment' :
               step === 'delivery-address' ? 'Delivery Address' :
               step === 'payment-method' ? 'Payment' : 'Card Details'}
            </h2>
          )}
          <button onClick={closeDrawer} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><FiX size={16} /></button>
        </div>

        {/* Step: Success */}
        {step === 'success' && successData && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 64, color: 'var(--color-primary)', marginBottom: 16 }}>
              {successData.deliveryMethod === 'delivery' ? <FiTruck /> : <FiCheckCircle />}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {successData.deliveryMethod === 'delivery' ? 'Order Placed!' : 'Booking Confirmed!'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              {successData.message}
            </p>

            <div style={{ background: 'var(--color-bg)', padding: '16px 32px', borderRadius: 12, border: '1px dashed var(--color-primary)', marginBottom: 20, width: '100%' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>BOOKING REFERENCE</div>
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, color: 'var(--color-text)' }}>{successData.bookingRef}</span>
            </div>

            <div style={{ width: '100%', background: 'var(--color-bg)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Pharmacy</span>
                <strong>{successData.pharmacyName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fulfillment</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {successData.deliveryMethod === 'delivery' ? <><FiTruck size={13} /> Delivery</> : <><FiPackage size={13} /> Pickup</>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Payment</span>
                <span>{successData.paymentMethod === 'online' ? '✅ Paid Online' : '💵 Pay at Pharmacy'}</span>
              </div>
              {successData.deliveryAddress && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Deliver to</span>
                  <span style={{ maxWidth: 180, textAlign: 'right', fontSize: 12 }}>{successData.deliveryAddress}</span>
                </div>
              )}
              {successData.transactionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Transaction</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{successData.transactionId}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Paid</span>
                <span>${successData.total.toFixed(2)}</span>
              </div>
            </div>

            {successData.deliveryMethod === 'delivery' ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                Estimated delivery: <strong>30–60 minutes</strong>. You'll receive updates on your order status.
              </p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                Show this code at <strong>{successData.pharmacyName}</strong> to collect your medicines.
              </p>
            )}

            <button className="btn btn-primary btn-full" onClick={closeDrawer}>Done</button>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontWeight: 600, fontSize: 16 }}>Processing payment...</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Please wait while we securely process your payment.</p>
          </div>
        )}

        {/* Step: Cart */}
        {step === 'cart' && (
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
                  <span>Reserve expires in 10 min. Checkout each pharmacy separately.</span>
                </div>
                {groups.map(group => (
                  <div key={group.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiShoppingBag size={14} color="#0284a8" />
                      {group.name}
                    </div>
                    <div style={{ padding: '0 16px' }}>
                      {group.items.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{item.medicine?.genericName}</div>
                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: item.isExpired ? '#fee2e2' : '#fef3c7', color: item.isExpired ? '#dc2626' : '#D97706' }}>
                                <FiClock size={10} />
                                {item.isExpired ? 'Expired' : `${Math.floor(item.remainingSeconds / 60)}:${(item.remainingSeconds % 60).toString().padStart(2, '0')}`}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 800, fontSize: 14, color: '#0284a8' }}>
                                  ${(Number(item.price) * item.quantity).toFixed(2)}
                                  {item.quantity > 1 && <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}> (×{item.quantity})</span>}
                                </span>
                                <button className="btn-icon" onClick={() => removeFromCart(item.id)} style={{ padding: 4 }}>
                                  <FiTrash2 size={14} color="#94a3b8" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 800, fontSize: 15 }}>
                        <span style={{ color: '#64748b' }}>Subtotal</span>
                        <span style={{ color: '#0284a8' }}>${group.subtotal.toFixed(2)}</span>
                      </div>
                      <button
                        style={{ width: '100%', height: 44, background: group.items.some((i: any) => i.isExpired) ? '#e2e8f0' : 'linear-gradient(135deg, #0284a8, #02C39A)', color: group.items.some((i: any) => i.isExpired) ? '#94a3b8' : '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: group.items.some((i: any) => i.isExpired) ? 'not-allowed' : 'pointer', boxShadow: group.items.some((i: any) => i.isExpired) ? 'none' : '0 4px 14px rgba(2,132,168,0.3)' }}
                        onClick={() => startCheckout(group.id, group.name, group.subtotal)}
                        disabled={group.items.some((i: any) => i.isExpired)}
                      >
                        Checkout {group.name} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Fulfillment (Pickup vs Delivery) */}
        {step === 'fulfillment' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              How would you like to receive your medicines from <strong>{state.pharmacyName}</strong>?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {(['pickup', 'delivery'] as DeliveryMethod[]).map(method => (
                <button
                  key={method}
                  onClick={() => setState(s => ({ ...s, deliveryMethod: method }))}
                  style={{
                    padding: '16px', border: `2px solid ${state.deliveryMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, background: state.deliveryMethod === method ? 'var(--color-primary-bg, #f0f7ff)' : 'var(--color-surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{method === 'pickup' ? '🏪' : '🚚'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{method === 'pickup' ? 'Pick Up In-Store' : 'Home Delivery'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {method === 'pickup' ? 'Collect your medicines directly at the pharmacy' : `Delivered to your door · $${DELIVERY_FEE.toFixed(2)} delivery fee`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>Subtotal</span><span>${state.groupTotal.toFixed(2)}</span>
              </div>
              {state.deliveryMethod === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
                  <span>Delivery fee</span><span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8 }}>
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setStep(state.deliveryMethod === 'delivery' ? 'delivery-address' : 'payment-method')}
              style={{ height: 44 }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step: Delivery Address */}
        {step === 'delivery-address' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Enter the address where you'd like your medicines delivered.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                <div style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}><FiMapPin size={14} /> Delivery Address *</div>
                <textarea
                  value={state.deliveryAddress}
                  onChange={e => setState(s => ({ ...s, deliveryAddress: e.target.value }))}
                  placeholder="e.g. 12 Samora Machel Ave, Harare"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                <div style={{ marginBottom: 6 }}>Delivery Notes (optional)</div>
                <textarea
                  value={state.deliveryNotes}
                  onChange={e => setState(s => ({ ...s, deliveryNotes: e.target.value }))}
                  placeholder="e.g. Call when outside, gate code 1234"
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </label>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setStep('payment-method')}
              disabled={!state.deliveryAddress.trim()}
              style={{ height: 44, marginTop: 24 }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step: Payment Method */}
        {step === 'payment-method' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500, border: '1px solid #fca5a5' }}>
                ⚠️ {error}
              </div>
            )}
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              How would you like to pay?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {(['online', 'in_person'] as PaymentMethod[]).map(method => (
                <button
                  key={method}
                  onClick={() => setState(s => ({ ...s, paymentMethod: method }))}
                  style={{
                    padding: '16px', border: `2px solid ${state.paymentMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, background: state.paymentMethod === method ? 'var(--color-primary-bg, #f0f7ff)' : 'var(--color-surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{method === 'online' ? '💳' : '💵'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{method === 'online' ? 'Pay Online Now' : state.deliveryMethod === 'delivery' ? 'Pay Driver on Delivery' : 'Pay at Pharmacy'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {method === 'online' ? 'Secure card payment · Instant confirmation' : state.deliveryMethod === 'delivery' ? 'Pay cash when your order arrives' : 'Pay at the counter when you collect'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => state.paymentMethod === 'online' ? setStep('card-details') : handleFinalCheckout()}
              style={{ height: 44 }}
            >
              {state.paymentMethod === 'online' ? 'Enter Card Details →' : 'Confirm Booking →'}
            </button>
          </div>
        )}

        {/* Step: Card Details */}
        {step === 'card-details' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {/* Error shown at TOP so user always sees it */}
            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500, border: '1px solid #fca5a5' }}>
                ⚠️ {error}
              </div>
            )}
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534', marginBottom: 20 }}>
              🔒 Simulated secure payment · No real charges
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                <div style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}><FiCreditCard size={14} /> Card Number</div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={state.cardNumber}
                  onChange={e => setState(s => ({ ...s, cardNumber: formatCard(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, boxSizing: 'border-box' }}
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                <div style={{ marginBottom: 6 }}>Cardholder Name</div>
                <input
                  type="text"
                  value={state.cardName}
                  onChange={e => setState(s => ({ ...s, cardName: e.target.value }))}
                  placeholder="Name on card"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, boxSizing: 'border-box' }}
                />
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                  <div style={{ marginBottom: 6 }}>Expiry</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.cardExpiry}
                    onChange={e => setState(s => ({ ...s, cardExpiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                  <div style={{ marginBottom: 6 }}>CVC</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.cardCvc}
                    onChange={e => setState(s => ({ ...s, cardCvc: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                    placeholder="123"
                    maxLength={4}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                <span>Total to charge</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleFinalCheckout}
              disabled={!isCardReady(state.cardNumber, state.cardExpiry, state.cardCvc)}
              style={{ height: 44 }}
            >
              <FiDollarSign style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Pay ${grandTotal.toFixed(2)}
            </button>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 10 }}>
              This is a payment simulation. No real charges apply.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
