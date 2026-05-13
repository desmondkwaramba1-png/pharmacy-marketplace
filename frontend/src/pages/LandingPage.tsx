import { useNavigate } from 'react-router-dom';
import { FaPills } from 'react-icons/fa';
import { FiSearch, FiMapPin, FiShoppingCart, FiClock, FiArrowRight } from 'react-icons/fi';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaPills size={24} color="var(--color-primary)" />
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>MediFind</span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/login')}
          style={{ fontSize: 13, padding: '8px 18px' }}
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(2,128,144,0.25)',
          }}>
            <FaPills size={32} color="white" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: 'var(--color-text)' }}>
            Find your medicine,{' '}
            <span style={{ color: 'var(--color-primary)' }}>nearby and in stock</span>
          </h1>

          <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 40 }}>
            MediFind connects patients with pharmacies across Zimbabwe.
            Search for medicines, reserve your order in minutes, and collect at your pharmacy — no more wasted trips.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto 48px' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login?tab=patient')}
                style={{ flex: 1, height: 52, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                I'm a Patient <FiArrowRight />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/login?tab=pharmacy')}
                style={{ flex: 1, height: 52, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                I'm a Pharmacy <FiArrowRight />
              </button>
            </div>
            <button
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-secondary)',
                fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
              }}
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign in
            </button>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, textAlign: 'left' }}>
            {[
              { icon: <FiSearch size={20} />, title: 'Search medicines', desc: 'Find any medicine by name, dosage, or category across all pharmacies.' },
              { icon: <FiMapPin size={20} />, title: 'See what\'s near you', desc: 'Map view shows pharmacies with stock closest to your location.' },
              { icon: <FiShoppingCart size={20} />, title: 'Reserve your order', desc: 'Add to cart and hold your medicines while you travel to collect.' },
              { icon: <FiClock size={20} />, title: 'Skip the wait', desc: 'Your order is ready when you arrive — no searching, no disappointment.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: '16px 14px',
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Pharmacy CTA strip */}
          <div style={{
            marginTop: 32, background: 'linear-gradient(135deg, var(--color-primary), #024950)',
            borderRadius: 16, padding: '24px 20px', color: 'white', textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Are you a pharmacy owner?</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              Join MediFind and reach thousands of patients
            </div>
            <button
              className="btn"
              onClick={() => navigate('/login?tab=pharmacy')}
              style={{
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', fontSize: 13,
                fontWeight: 600, padding: '10px 24px',
              }}
            >
              Register your pharmacy →
            </button>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}>
        © {new Date().getFullYear()} MediFind Zimbabwe
      </footer>
    </div>
  );
}
