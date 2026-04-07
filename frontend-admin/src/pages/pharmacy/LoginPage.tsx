import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPills } from 'react-icons/fa';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (n: number) => {
    setEmail(`admin@pharmacy${n}.com`);
    setPassword('Password123');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon"><FaPills color="white" /></span>
          <div className="login-logo-title">MediFind Zimbabwe</div>
          <div className="login-logo-sub">Pharmacy Admin Portal</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error"><FiAlertTriangle style={{ marginRight: 6 }} /> {error}</div>}

          <div className="form-group">
            <label className="form-label required" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pharmacy.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="divider" />

        {/* Demo accounts */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Quick Login (Demo Accounts):
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                type="button"
                className="pill active"
                style={{ fontSize: 11 }}
                onClick={() => {
                  setEmail(`admin@pharmacy${n}.com`);
                  setPassword('Password123');
                }}
              >
                Pharma {n}
              </button>
            ))}
            <button
              type="button"
              className="pill active"
              style={{ fontSize: 11, background: 'rgba(2, 128, 144, 0.15)', borderColor: 'var(--color-primary)' }}
              onClick={() => {
                setEmail('demo@medifind.com');
                setPassword('Password123');
              }}
            >
              Demo Lab 🧪
            </button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 8 }}>
            Or type your own credentials linked via SQL
          </p>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            type="button"
            className="btn-ghost btn"
            onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiArrowLeft /> Back to Patient App
          </button>
        </div>
      </div>
    </div>
  );
}
