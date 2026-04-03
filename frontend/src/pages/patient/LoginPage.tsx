import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { authApi } from '../../api/auth';
import { cartApi } from '../../api/cart';
import { FiChevronLeft, FiLogOut, FiShoppingCart, FiClock, FiCheckCircle, FiPackage, FiInfo } from 'react-icons/fi';
import { FaPills, FaUserCircle, FaClinicMedical } from 'react-icons/fa';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const { cart, setCartOpen } = useCart();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/';
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, firstName, lastName);
        // Supabase will handle the login automatically on successful register (if email confirm is off)
        // or the user will need to confirm email. 
        // We'll let onAuthStateChange handle the redirect.
      } else {
        await login(email, password);
        navigate(returnTo, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Fetch booking history if authenticated
  const { data: historyData } = useQuery({
    queryKey: ['cart-history'],
    queryFn: () => cartApi.getHistory(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  // Show account page if already authenticated
  if (isAuthenticated && user) {
    const activeItems = cart?.items?.filter((i: any) => !i.isExpired) || [];
    const historyItems = historyData?.items || [];

    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Back"><FiChevronLeft /></button>
          <h1 className="app-header-title">My Account</h1>
        </header>
        <div className="page-content" style={{ paddingTop: 24 }}>
          {/* Profile Card */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'linear-gradient(135deg, var(--color-primary), #024950)',
            borderRadius: 16, padding: '28px 20px', marginBottom: 24, color: 'white',
          }}>
            <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.9 }}><FaUserCircle /></div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{user.firstName} {user.lastName}</h2>
            <p style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 16px' }}>{user.email}</p>
            <button
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 20px', borderRadius: 20,
              }}
              onClick={handleLogout}
            >
              <FiLogOut /> Sign Out
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: '18px 14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <FiShoppingCart size={24} color="var(--color-primary)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>My Cart</span>
              {cart && cart.itemCount > 0 && (
                <span style={{
                  fontSize: 11, background: 'var(--color-primary)', color: 'white',
                  padding: '2px 10px', borderRadius: 10, fontWeight: 700,
                }}>
                  {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/map')}
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: '18px 14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <FaClinicMedical size={24} color="var(--color-primary)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Nearby Pharmacies</span>
            </button>
          </div>

          {/* Active Reservations */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiClock size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Reservations</h3>
            </div>
            {activeItems.length === 0 ? (
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
                color: 'var(--color-text-secondary)', fontSize: 13,
              }}>
                <FiPackage size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No active reservations</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>Search for medicines to get started</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeItems.map((item: any) => (
                  <div key={item.id} style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.medicine?.genericName || 'Medicine'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {item.pharmacy?.name} · Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{
                        background: item.remainingSeconds > 300 ? '#10B981' : '#F59E0B',
                        color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                      }}>
                        {Math.floor(item.remainingSeconds / 60)}:{String(item.remainingSeconds % 60).padStart(2, '0')}
                      </div>
                    </div>
                    {item.price && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginTop: 6 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking History */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiCheckCircle size={18} color="#10B981" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Booking History</h3>
            </div>
            {historyItems.length === 0 ? (
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
                color: 'var(--color-text-secondary)', fontSize: 13,
              }}>
                <FiCheckCircle size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No booking history yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>Your confirmed bookings will show up here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {historyItems.map((item: any) => (
                  <div key={item.id} style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.medicine?.genericName || 'Medicine'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {item.pharmacy?.name} · Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{
                        background: '#10B981', color: 'white', fontSize: 11,
                        fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                      }}>
                        ✓ Confirmed
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                      Booked {timeAgo(item.reservedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div style={{
            background: 'var(--color-surface)', padding: '12px 16px', borderRadius: 12,
            border: '1px solid var(--color-border)', marginBottom: 24,
            fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <FiInfo size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--color-primary)" />
            <span>
              Your cart reservations last <strong style={{ color: 'var(--color-primary)' }}>10 minutes</strong>.
              Make sure to collect your medicine at the pharmacy before the reservation expires.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back"><FiChevronLeft /></button>
        <h1 className="app-header-title">{isRegister ? 'Create Account' : 'Sign In'}</h1>
      </header>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><FaPills color="var(--color-primary)" /></div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>MediFind Zimbabwe</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24, textAlign: 'center' }}>
          {isRegister ? 'Create an account to reserve medicines' : 'Sign in to add medicines to your cart'}
        </p>

        {/* Message from redirect (e.g. cart gate) */}
        {message && (
          <div style={{
            background: 'linear-gradient(135deg, #e0f7fa, #e8f5e9)',
            color: '#024950', padding: '12px 16px', borderRadius: 12, fontSize: 13,
            marginBottom: 16, width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid rgba(2,128,144,0.2)',
          }}>
            <FiInfo size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--color-error)', color: 'white', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16, width: '100%', maxWidth: 400 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {isRegister ? (
            <>Already have an account? <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => { setIsRegister(false); setError(''); }}>Sign In</button></>
          ) : (
            <>Don't have an account? <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => { setIsRegister(true); setError(''); }}>Create Account</button></>
          )}
        </div>
      </div>
    </div>
  );
}
