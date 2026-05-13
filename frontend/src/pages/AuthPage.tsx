import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth, RegisterPharmacyData } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cartApi } from '../api/cart';
import {
  FiLogOut, FiShoppingCart, FiClock,
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

/* ── Tab bar ─────────────────────────────────────────────────────────── */
function TabBar({ active, onChange }: { active: AuthTab; onChange: (t: AuthTab) => void }) {
  const tabs: { id: AuthTab; label: string; emoji: string }[] = [
    { id: 'login',    label: 'Sign In',   emoji: '🔑' },
    { id: 'patient',  label: 'Patient',   emoji: '🏥' },
    { id: 'pharmacy', label: 'Pharmacy',  emoji: '💊' },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--color-bg)', borderRadius: 14,
      padding: 4, marginBottom: 28, gap: 3,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: active === t.id ? 700 : 500,
            background: active === t.id ? 'var(--color-surface)' : 'transparent',
            color: active === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: active === t.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-spring)',
            transform: active === t.id ? 'scale(1.02)' : 'scale(1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Sign In form ────────────────────────────────────────────────────── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{
          background: 'var(--color-error-bg)', color: 'var(--color-error-text)',
          padding: '11px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(232,93,93,0.2)',
          animation: 'fadeInUp 0.25s ease',
        }}>
          {error}
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="form-input" type="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input" type="password" required minLength={8}
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </form>
  );
}

/* ── Patient register form ───────────────────────────────────────────── */
function PatientForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email.toLowerCase().trim(), password, firstName, lastName);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && (
        <div style={{
          background: 'var(--color-error-bg)', color: 'var(--color-error-text)',
          padding: '11px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(232,93,93,0.2)', animation: 'fadeInUp 0.25s ease',
        }}>
          {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input className="form-input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input className="form-input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>
      <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
        {loading ? 'Creating account…' : 'Create Patient Account →'}
      </button>
    </form>
  );
}

/* ── Pharmacy multi-step form ────────────────────────────────────────── */
function PharmacyForm({ onSuccess }: { onSuccess: () => void }) {
  const { registerPharmacy } = useAuth();
  const [step, setStep]           = useState<PharmacyStep>('account');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [pharmName, setPharmName] = useState('');
  const [address,   setAddress]   = useState('');
  const [suburb,    setSuburb]    = useState('');
  const [city,      setCity]      = useState('Harare');
  const [phone,     setPhone]     = useState('');
  const [lat,       setLat]       = useState<number | undefined>();
  const [lng,       setLng]       = useState<number | undefined>();
  const [locating,  setLocating]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false); },
      () =>  { setError('Could not get location'); setLocating(false); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data: RegisterPharmacyData = {
        email: email.toLowerCase().trim(), password,
        firstName, lastName,
        pharmacyName: pharmName, address, suburb, city, phone,
        latitude: lat, longitude: lng,
      };
      await registerPharmacy(data);
      setStep('done');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', animation: 'fadeScaleIn 0.3s ease' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'var(--color-success-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiCheck size={28} color="var(--color-success-text)" strokeWidth={3} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pharmacy registered!</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Your pharmacy is now listed. Redirecting you to the dashboard…
        </p>
      </div>
    );
  }

  const steps: PharmacyStep[] = ['account', 'pharmacy'];
  const stepIdx = steps.indexOf(step);

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: i <= stepIdx ? 'var(--color-primary)' : 'var(--color-bg)',
              color: i <= stepIdx ? 'white' : 'var(--color-text-disabled)',
              border: i <= stepIdx ? 'none' : '2px solid var(--color-border)',
              transition: 'all var(--transition-base)',
            }}>
              {i < stepIdx ? <FiCheck size={13} strokeWidth={3} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: 2, transition: 'background var(--transition-base)' }} />
            )}
          </div>
        ))}
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 6, fontWeight: 500 }}>
          Step {stepIdx + 1} of {steps.length}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--color-error-bg)', color: 'var(--color-error-text)',
          padding: '11px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(232,93,93,0.2)', marginBottom: 16,
          animation: 'fadeInUp 0.25s ease',
        }}>
          {error}
        </div>
      )}

      {step === 'account' && (
        <form onSubmit={e => { e.preventDefault(); setStep('pharmacy'); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="pharmacy@example.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: 4 }}>
            Next: Pharmacy Details <FiArrowRight size={15} />
          </button>
        </form>
      )}

      {step === 'pharmacy' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Pharmacy Name</label>
            <input className="form-input" required value={pharmName} onChange={e => setPharmName(e.target.value)} placeholder="City Pharmacy" />
          </div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input className="form-input" required value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Samora Machel Ave" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Suburb</label>
              <input className="form-input" value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="Avondale" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" required value={city} onChange={e => setCity(e.target.value)} placeholder="Harare" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+263 77 000 0000" />
          </div>

          {/* Geolocation */}
          <div style={{
            background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Location (optional)</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {lat && lng ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Helps patients find you on the map'}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={getLocation}
                disabled={locating}
                style={{ flexShrink: 0, gap: 5 }}
              >
                <FiMapPin size={13} />
                {locating ? 'Locating…' : lat ? 'Update' : 'Get Location'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: '0 0 auto', gap: 5 }}
              onClick={() => setStep('account')}
            >
              <FiArrowLeft size={15} /> Back
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Registering…' : 'Register Pharmacy →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Main AuthPage ───────────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();

  const tabParam = searchParams.get('tab') as AuthTab | null;
  const [tab, setTab] = useState<AuthTab>(tabParam ?? 'login');

  useEffect(() => {
    if (tabParam && ['login', 'patient', 'pharmacy'].includes(tabParam)) {
      setTab(tabParam as AuthTab);
    }
  }, [tabParam]);

  const handleSuccess = () => {
    import('../api/supabaseClient').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        const role = user?.user_metadata?.role;
        navigate(role === 'pharmacist' ? '/admin/dashboard' : '/home', { replace: true });
      });
    });
  };

  if (isLoading) return null;
  if (isAuthenticated) {
    navigate(isPharmacist ? '/admin/dashboard' : '/home', { replace: true });
    return null;
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #012d35 0%, #028090 50%, #01697a 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 10s ease infinite',
      padding: 'clamp(16px, 4vw, 40px)',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Card */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'clamp(24px, 4vw, 40px)',
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.12)',
        animation: 'fadeScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <FaPills size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', marginBottom: 4 }}>
            MediFind <span style={{ color: 'var(--color-primary)' }}>Zimbabwe</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {tab === 'login'    ? 'Welcome back — sign in to continue'    :
             tab === 'patient'  ? 'Create a patient account to get started' :
             'Register your pharmacy on MediFind'}
          </p>
        </div>

        <TabBar active={tab} onChange={setTab} />

        <div style={{ animation: 'fadeInUp 0.25s ease' }} key={tab}>
          {tab === 'login'    && <LoginForm    onSuccess={handleSuccess} />}
          {tab === 'patient'  && <PatientForm  onSuccess={handleSuccess} />}
          {tab === 'pharmacy' && <PharmacyForm onSuccess={handleSuccess} />}
        </div>

        {/* Switch hint */}
        {(tab === 'login' || tab === 'patient') && (
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {tab === 'login' ? (
              <>No account? <button style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => setTab('patient')}>Create one</button></>
            ) : (
              <>Already have an account? <button style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => setTab('login')}>Sign in</button></>
            )}
          </p>
        )}
      </div>

      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 20, color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
      >
        ← Back to home
      </button>
    </div>
  );
}

/* ── Account page (exported separately for /account route) ──────────── */
export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, setCartOpen } = useCart();

  const { data: historyData } = useQuery({
    queryKey: ['cart-history'],
    queryFn: () => cartApi.getHistory(),
    staleTime: 30_000,
  });

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  if (!user) return null;

  const activeItems  = cart?.items?.filter((i: any) => !i.isExpired) || [];
  const historyItems = historyData?.items || [];

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 24, maxWidth: 600 }}>
        {/* Profile card */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          borderRadius: 20, padding: 'clamp(24px,4vw,36px) 20px', marginBottom: 24, color: 'white',
          boxShadow: 'var(--shadow-primary)', animation: 'fadeInUp 0.3s ease both',
        }}>
          <div style={{ fontSize: 58, marginBottom: 12, opacity: 0.9, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}><FaUserCircle /></div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{user.firstName} {user.lastName}</h2>
          <p style={{ fontSize: 13, opacity: 0.75, margin: '4px 0 18px' }}>{user.email}</p>
          <button
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 13, padding: '8px 22px', borderRadius: 20,
              transition: 'all var(--transition-spring)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
            onClick={handleLogout}
          >
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            {
              icon: <FiShoppingCart size={24} color="var(--color-primary)" />,
              label: 'My Cart',
              badge: cart?.itemCount ? `${cart.itemCount} item${cart.itemCount > 1 ? 's' : ''}` : null,
              onClick: () => setCartOpen(true),
            },
            {
              icon: <FaClinicMedical size={24} color="var(--color-primary)" />,
              label: 'Nearby Pharmacies',
              badge: null,
              onClick: () => navigate('/map'),
            },
          ].map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              style={{
                background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                borderRadius: 16, padding: '18px 14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'pointer',
                transition: 'all var(--transition-spring)', boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(2,128,144,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              {action.icon}
              <span style={{ fontSize: 13, fontWeight: 700 }}>{action.label}</span>
              {action.badge && (
                <span style={{ fontSize: 11, background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Reservations */}
        <Section icon={<FiClock size={17} color="var(--color-primary)" />} title="Active Reservations">
          {activeItems.length === 0 ? (
            <EmptyCard icon={<FiPackage size={28} />} text="No active reservations" sub="Search for medicines to get started" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeItems.map((item: any) => (
                <ReservationCard key={item.id} item={item} active />
              ))}
            </div>
          )}
        </Section>

        {/* Booking History */}
        <Section icon={<FiCheckCircle size={17} color="var(--color-success)" />} title="Booking History">
          {historyItems.length === 0 ? (
            <EmptyCard icon={<FiCheckCircle size={28} />} text="No booking history yet" sub="Your confirmed bookings will appear here" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historyItems.map((item: any) => (
                <ReservationCard key={item.id} item={item} active={false} />
              ))}
            </div>
          )}
        </Section>

        {/* Info notice */}
        <div style={{
          background: 'var(--color-surface)', padding: '12px 16px', borderRadius: 14,
          border: '1px solid var(--color-border)', marginBottom: 24,
          fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 10, alignItems: 'flex-start',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <FiInfo size={17} style={{ flexShrink: 0, marginTop: 2 }} color="var(--color-primary)" />
          <span>
            Cart reservations last <strong style={{ color: 'var(--color-primary)' }}>10 minutes</strong>.
            Collect your medicine at the pharmacy before the reservation expires.
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyCard({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
      borderRadius: 14, padding: '22px 16px', textAlign: 'center',
      color: 'var(--color-text-secondary)', fontSize: 13,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ marginBottom: 8, opacity: 0.4 }}>{icon}</div>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{text}</p>
      <p style={{ margin: '4px 0 0', fontSize: 12 }}>{sub}</p>
    </div>
  );
}

function ReservationCard({ item, active }: { item: any; active: boolean }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
      borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--shadow-sm)',
      transition: 'border-color var(--transition-fast)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
            {item.medicine?.genericName || 'Medicine'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {item.pharmacy?.name} · Qty: {item.quantity}
          </div>
          {!active && (
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 4 }}>
              Booked {timeAgo(item.reservedAt)}
            </div>
          )}
        </div>
        {active && item.remainingSeconds != null ? (
          <div style={{
            background: item.remainingSeconds > 300 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
            color: item.remainingSeconds > 300 ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 10, whiteSpace: 'nowrap',
          }}>
            {Math.floor(item.remainingSeconds / 60)}:{String(item.remainingSeconds % 60).padStart(2, '0')}
          </div>
        ) : (
          <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 10 }}>
            ✓ Confirmed
          </div>
        )}
      </div>
      {item.price && (
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)', marginTop: 8 }}>
          ${(item.price * item.quantity).toFixed(2)}
        </div>
      )}
    </div>
  );
}
