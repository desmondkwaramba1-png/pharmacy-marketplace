import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth, RegisterPharmacyData } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cartApi } from '../api/cart';
import {
  FiChevronLeft, FiLogOut, FiShoppingCart, FiClock,
  FiCheckCircle, FiPackage, FiInfo, FiArrowRight, FiArrowLeft, FiCheck, FiMapPin,
} from 'react-icons/fi';
import { FaPills, FaUserCircle, FaClinicMedical } from 'react-icons/fa';

type AuthTab = 'login' | 'patient' | 'pharmacy';
type PharmacyStep = 'account' | 'pharmacy' | 'done';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Tab switcher ──────────────────────────────────────────────────────────────
function TabBar({ active, onChange }: { active: AuthTab; onChange: (t: AuthTab) => void }) {
  const tabs: { id: AuthTab; label: string }[] = [
    { id: 'login', label: 'Sign In' },
    { id: 'patient', label: 'Patient' },
    { id: 'pharmacy', label: 'Pharmacy' },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--color-bg)', borderRadius: 12,
      padding: 4, marginBottom: 24, gap: 2,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: active === t.id ? 700 : 500,
            background: active === t.id ? 'var(--color-card)' : 'transparent',
            color: active === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: active === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Sign In form ──────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div className="login-error">⚠️ {error}</div>}
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="form-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
          required autoCapitalize="none" autoCorrect="off"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input" type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
        />
      </div>
      <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: 46 }}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

// ── Patient registration form ─────────────────────────────────────────────────
function PatientForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email.toLowerCase().trim(), form.password, form.firstName, form.lastName);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const valid = form.firstName && form.email && form.password.length >= 6;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div className="login-error">⚠️ {error}</div>}
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label required">First Name</label>
          <input className="form-input" value={form.firstName} onChange={set('firstName')} placeholder="John" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Last Name</label>
          <input className="form-input" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label required">Email</label>
        <input
          className="form-input" type="email" value={form.email}
          onChange={set('email')} placeholder="you@example.com"
          autoCapitalize="none" autoCorrect="off"
        />
      </div>
      <div className="form-group">
        <label className="form-label required">Password</label>
        <input
          className="form-input" type="password" value={form.password}
          onChange={set('password')} placeholder="Min 6 characters"
        />
      </div>
      <button className="btn btn-primary btn-full" type="submit" disabled={!valid || loading} style={{ height: 46 }}>
        {loading ? 'Creating account…' : 'Create Patient Account'}
      </button>
    </form>
  );
}

// ── Pharmacy registration (2-step) ────────────────────────────────────────────
function PharmacyForm({ onSuccess }: { onSuccess: (pharmacyName: string) => void }) {
  const navigate = useNavigate();
  const { registerPharmacy } = useAuth();
  const [step, setStep] = useState<PharmacyStep>('account');
  const [form, setForm] = useState<RegisterPharmacyData>({
    email: '', password: '', firstName: '', lastName: '',
    pharmacyName: '', address: '', suburb: '', city: '', phone: '',
    latitude: undefined, longitude: undefined,
  });
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      return;
    }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocStatus('ok');
      },
      () => setLocStatus('error'),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const set = (f: keyof RegisterPharmacyData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await registerPharmacy(form);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps: PharmacyStep[] = ['account', 'pharmacy'];
  const accountValid = form.email && form.password.length >= 6 && form.firstName;
  const pharmacyValid = form.pharmacyName && form.address && form.city;

  if (step === 'done') return null; // handled by parent

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12, fontWeight: 700,
              background: step === s ? 'var(--color-primary)' : (i < steps.indexOf(step) ? 'var(--color-success, #10B981)' : 'var(--color-border)'),
              color: step === s || i < steps.indexOf(step) ? 'white' : 'var(--color-text-secondary)',
            }}>
              {i < steps.indexOf(step) ? <FiCheck size={13} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: step === s ? 600 : 400, color: step === s ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
              {s === 'account' ? 'Your Account' : 'Pharmacy Details'}
            </span>
            {i === 0 && <div style={{ width: 20, height: 1, background: 'var(--color-border)' }} />}
          </div>
        ))}
      </div>

      {error && <div className="login-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}

      {step === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label required">First Name</label>
              <input className="form-input" value={form.firstName} onChange={set('firstName')} placeholder="John" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@pharmacy.co.zw" autoCapitalize="none" />
          </div>
          <div className="form-group">
            <label className="form-label required">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={() => setStep('pharmacy')}
            disabled={!accountValid}
            style={{ height: 46 }}
          >
            Next: Pharmacy Details <FiArrowRight />
          </button>
        </div>
      )}

      {step === 'pharmacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label required">Pharmacy Name</label>
            <input className="form-input" value={form.pharmacyName} onChange={set('pharmacyName')} placeholder="e.g. City Health Pharmacy" />
          </div>
          <div className="form-group">
            <label className="form-label required">Street Address</label>
            <input className="form-input" value={form.address} onChange={set('address')} placeholder="e.g. 45 Samora Machel Ave" />
          </div>

          {/* Location picker */}
          <div>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
              Exact Location <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(helps patients find you on the map)</span>
            </label>
            <button
              type="button"
              onClick={getLocation}
              disabled={locStatus === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 14px', borderRadius: 10, cursor: locStatus === 'loading' ? 'wait' : 'pointer',
                border: `1.5px solid ${locStatus === 'ok' ? 'var(--color-success, #10B981)' : locStatus === 'error' ? 'var(--color-error, #ef4444)' : 'var(--color-border)'}`,
                background: locStatus === 'ok' ? '#f0fdf4' : locStatus === 'error' ? '#fef2f2' : 'var(--color-bg)',
                color: locStatus === 'ok' ? '#10B981' : locStatus === 'error' ? '#ef4444' : 'var(--color-text)',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              }}
            >
              <FiMapPin size={16} style={{ flexShrink: 0 }} />
              {locStatus === 'idle' && 'Use my current location'}
              {locStatus === 'loading' && 'Getting location…'}
              {locStatus === 'ok' && `Location set (${form.latitude?.toFixed(4)}, ${form.longitude?.toFixed(4)})`}
              {locStatus === 'error' && 'Location unavailable — tap to retry'}
            </button>
            {locStatus === 'error' && (
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, marginBottom: 0 }}>
                Make sure you are at the pharmacy and allow location access in your browser.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Suburb</label>
              <input className="form-input" value={form.suburb} onChange={set('suburb')} placeholder="e.g. Avondale" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label required">City</label>
              <input className="form-input" value={form.city} onChange={set('city')} placeholder="Harare" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+263 77 123 4567" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setStep('account')} style={{ height: 46, flex: 1 }}>
              <FiArrowLeft /> Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!pharmacyValid || loading}
              style={{ height: 46, flex: 2 }}
            >
              {loading ? 'Registering…' : 'Register Pharmacy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Account page (shown when already logged in) ───────────────────────────────
function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, isPharmacist } = useAuth();
  const { cart, setCartOpen } = useCart();

  const { data: historyData } = useQuery({
    queryKey: ['cart-history'],
    queryFn: () => cartApi.getHistory(),
    staleTime: 30_000,
  });

  const activeItems = cart?.items?.filter((i: any) => !i.isExpired) || [];
  const historyItems = historyData?.items || [];

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (isPharmacist) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Back"><FiChevronLeft /></button>
          <h1 className="app-header-title">My Account</h1>
        </header>
        <div className="page-content" style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 56 }}><FaClinicMedical color="var(--color-primary)" /></div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>{user?.email}</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/dashboard')} style={{ marginTop: 8 }}>
            Go to Pharmacy Dashboard
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiLogOut /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Back"><FiChevronLeft /></button>
        <h1 className="app-header-title">My Account</h1>
      </header>
      <div className="page-content" style={{ paddingTop: 24 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'linear-gradient(135deg, var(--color-primary), #024950)',
          borderRadius: 16, padding: '28px 20px', marginBottom: 24, color: 'white',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.9 }}><FaUserCircle /></div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 16px' }}>{user?.email}</p>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setCartOpen(true)} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 14, padding: '18px 14px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <FiShoppingCart size={24} color="var(--color-primary)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>My Cart</span>
            {cart && cart.itemCount > 0 && (
              <span style={{ fontSize: 11, background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>
                {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/map')} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 14, padding: '18px 14px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <FaClinicMedical size={24} color="var(--color-primary)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Nearby Pharmacies</span>
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FiClock size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Reservations</h3>
          </div>
          {activeItems.length === 0 ? (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
              <FiPackage size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No active reservations</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeItems.map((item: any) => (
                <div key={item.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.medicine?.genericName || 'Medicine'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.pharmacy?.name} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ background: item.remainingSeconds > 300 ? '#10B981' : '#F59E0B', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>
                      {Math.floor(item.remainingSeconds / 60)}:{String(item.remainingSeconds % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FiCheckCircle size={18} color="#10B981" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Booking History</h3>
          </div>
          {historyItems.length === 0 ? (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
              <FiCheckCircle size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No booking history yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historyItems.map((item: any) => (
                <div key={item.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.medicine?.genericName || 'Medicine'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.pharmacy?.name} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ background: '#10B981', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>✓ Confirmed</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>{timeAgo(item.reservedAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 24, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <FiInfo size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--color-primary)" />
          <span>Your cart reservations last <strong style={{ color: 'var(--color-primary)' }}>10 minutes</strong>. Collect your medicine before the reservation expires.</span>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [tab, setTab] = useState<AuthTab>('login');
  const [pharmacyName, setPharmacyName] = useState('');
  const [registered, setRegistered] = useState<'patient' | 'pharmacy' | null>(null);

  const returnTo = searchParams.get('returnTo') || '/';
  const message = searchParams.get('message');

  // Already logged in → show account page
  if (isAuthenticated) return <AccountPage />;

  const handleLoginSuccess = () => {
    // Auth state updates async via onAuthStateChange; navigate to redirect helper
    // which reads the fresh role and sends the user to the right place
    navigate('/auth/redirect', { replace: true });
  };

  const handlePatientSuccess = () => {
    setRegistered('patient');
  };

  const handlePharmacySuccess = (name: string) => {
    setPharmacyName(name);
    setRegistered('pharmacy');
  };

  // Success screens
  if (registered === 'patient') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Welcome to MediFind!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Your account is ready. Start searching for medicines near you.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/')} style={{ height: 46 }}>
              Find Medicines
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (registered === 'pharmacy') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>You're registered!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              <strong>{pharmacyName}</strong> is now on MediFind. Set up your inventory to start receiving patients.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/admin/dashboard')} style={{ height: 46 }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: tab === 'pharmacy' ? 480 : 420 }}>
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon"><FaPills color="var(--color-primary)" /></span>
          <div className="login-logo-title">MediFind</div>
          <div className="login-logo-sub">
            {tab === 'login' && 'Welcome back'}
            {tab === 'patient' && 'Find medicines near you'}
            {tab === 'pharmacy' && 'Join MediFind and reach more patients'}
          </div>
        </div>

        {message && (
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <FiInfo size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            {message}
          </div>
        )}

        <TabBar active={tab} onChange={t => setTab(t)} />

        {tab === 'login' && <LoginForm onSuccess={handleLoginSuccess} />}
        {tab === 'patient' && <PatientForm onSuccess={handlePatientSuccess} />}
        {tab === 'pharmacy' && <PharmacyForm onSuccess={handlePharmacySuccess} />}

        {tab === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            New here?{' '}
            <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => setTab('patient')}>
              Patient
            </button>
            {' '}or{' '}
            <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => setTab('pharmacy')}>
              Pharmacy
            </button>
          </p>
        )}
        {(tab === 'patient' || tab === 'pharmacy') && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => setTab('login')}>
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
