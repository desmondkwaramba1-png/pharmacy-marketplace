import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, RegisterPharmacyData } from '../context/AuthContext';
import { FaPills } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';

type Step = 'account' | 'pharmacy' | 'done';

export default function PharmacyRegisterPage() {
  const { registerPharmacy } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<RegisterPharmacyData>({
    email: '', password: '', firstName: '', lastName: '',
    pharmacyName: '', address: '', suburb: '', city: '', phone: '',
  });

  const set = (field: keyof RegisterPharmacyData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      await registerPharmacy(form);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const accountValid = form.email && form.password.length >= 6 && form.firstName;
  const pharmacyValid = form.pharmacyName && form.address && form.city;

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <span className="login-logo-icon"><FaPills color="var(--color-primary)" /></span>
          <div className="login-logo-title">Register Your Pharmacy</div>
          <div className="login-logo-sub">Join MediFind and reach more patients</div>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
            {(['account', 'pharmacy'] as Step[]).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: step === s ? 'var(--color-primary)' : (i < ['account', 'pharmacy'].indexOf(step) ? 'var(--color-success)' : 'var(--color-border)'),
                  color: step === s || i < ['account', 'pharmacy'].indexOf(step) ? 'white' : 'var(--color-text-secondary)',
                }}>
                  {i < ['account', 'pharmacy'].indexOf(step) ? <FiCheck size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === s ? 600 : 400, color: step === s ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
                  {s === 'account' ? 'Your Account' : 'Pharmacy Details'}
                </span>
                {i === 0 && <div style={{ width: 24, height: 1, background: 'var(--color-border)' }} />}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>
        )}

        {/* Step 1: Account */}
        {step === 'account' && (
          <div className="login-form">
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
              <label className="form-label required">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@pharmacy.co.zw" />
            </div>
            <div className="form-group">
              <label className="form-label required">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setStep('pharmacy')}
              disabled={!accountValid}
              style={{ height: 48, marginTop: 4 }}
            >
              Next: Pharmacy Details <FiArrowRight />
            </button>
          </div>
        )}

        {/* Step 2: Pharmacy details */}
        {step === 'pharmacy' && (
          <div className="login-form">
            <div className="form-group">
              <label className="form-label required">Pharmacy Name</label>
              <input className="form-input" value={form.pharmacyName} onChange={set('pharmacyName')} placeholder="e.g. City Health Pharmacy" />
            </div>
            <div className="form-group">
              <label className="form-label required">Street Address</label>
              <input className="form-input" value={form.address} onChange={set('address')} placeholder="e.g. 45 Samora Machel Ave" />
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
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button className="btn btn-secondary" onClick={() => setStep('account')} style={{ height: 48, flex: 1 }}>
                <FiArrowLeft /> Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!pharmacyValid || isLoading}
                style={{ height: 48, flex: 2 }}
              >
                {isLoading ? 'Registering...' : 'Register Pharmacy'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>You're registered!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Your pharmacy <strong>{form.pharmacyName}</strong> is now on MediFind.
              Check your email to verify your account, then log in to set up your inventory.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/admin/dashboard')} style={{ height: 48 }}>
              Go to Dashboard
            </button>
          </div>
        )}

        {step === 'account' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Already registered? <Link to="/admin/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
