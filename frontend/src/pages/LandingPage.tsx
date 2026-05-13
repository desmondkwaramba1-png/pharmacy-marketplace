import { useNavigate } from 'react-router-dom';
import { FaPills } from 'react-icons/fa';
import { FiSearch, FiMapPin, FiShoppingCart, FiClock, FiArrowRight, FiChevronRight } from 'react-icons/fi';

const features = [
  {
    icon: <FiSearch size={22} />,
    color: '#028090',
    bg: 'rgba(2,128,144,0.10)',
    title: 'Search medicines',
    desc: 'Find any medicine by name or category across all registered pharmacies instantly.',
  },
  {
    icon: <FiMapPin size={22} />,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: 'Nearby pharmacies',
    desc: 'See which pharmacies have stock near you on an interactive map.',
  },
  {
    icon: <FiShoppingCart size={22} />,
    color: '#059669',
    bg: '#D1FAE5',
    title: 'Reserve & hold',
    desc: 'Add to cart and hold your medicines for 10 minutes while you travel to collect.',
  },
  {
    icon: <FiClock size={22} />,
    color: '#D97706',
    bg: '#FEF3C7',
    title: 'Skip the wait',
    desc: 'Your order is ready when you arrive — no searching, no disappointment.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 40px)', height: 64,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <FaPills size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
            Medi<span style={{ color: 'var(--color-primary)' }}>Find</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginLeft: 4 }}>ZW</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none', border: '1.5px solid var(--color-border)', color: 'var(--color-text)',
            fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 10,
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(150deg, #012d35 0%, #014d5e 50%, #01697a 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 10s ease infinite',
        padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 100px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.15) 0%, transparent 70%)', top: -180, right: -120, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,168,0.18) 0%, transparent 70%)', bottom: -120, left: -80, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', animation: 'fadeInUp 0.6s ease both' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600,
            padding: '6px 16px', borderRadius: 999, marginBottom: 28,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02C39A', display: 'inline-block', boxShadow: '0 0 6px #02C39A' }} />
            🇿🇼 Available across Zimbabwe
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 6vw, 56px)', fontWeight: 800, color: 'white',
            lineHeight: 1.12, marginBottom: 20, letterSpacing: '-0.04em',
          }}>
            Find your medicine,{' '}
            <span style={{ color: '#02C39A' }}>nearby and in stock</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.7, marginBottom: 44, maxWidth: 480, margin: '0 auto 44px',
          }}>
            MediFind connects patients with pharmacies in real time. Search for
            medicines, reserve your order, and collect — no more wasted trips.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login?tab=patient')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--color-primary)',
                fontSize: 15, fontWeight: 700,
                padding: 'clamp(12px,2vw,16px) clamp(20px,3vw,32px)',
                borderRadius: 14, border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                transition: 'all var(--transition-spring)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              I'm a Patient <FiArrowRight />
            </button>
            <button
              onClick={() => navigate('/login?tab=pharmacy')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.12)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.30)',
                fontSize: 15, fontWeight: 600,
                padding: 'clamp(12px,2vw,16px) clamp(20px,3vw,32px)',
                borderRadius: 14, cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all var(--transition-spring)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              Register Pharmacy <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,40px)', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
            Everything you need, in one app
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: 16,
        }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', padding: 'clamp(16px,2vw,24px)',
                transition: 'box-shadow var(--transition-base), transform var(--transition-spring)',
                animation: `fadeInUp 0.4s ease ${0.05 * i + 0.1}s both`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, background: f.bg, color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                border: `1px solid ${f.color}22`,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pharmacy CTA banner */}
      <section style={{ padding: '0 clamp(16px,4vw,40px) clamp(40px,6vw,72px)', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, #012d35 0%, #01697a 100%)',
          borderRadius: 'var(--radius-2xl)', padding: 'clamp(24px,4vw,44px) clamp(20px,4vw,40px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 16, position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(1,45,53,0.3)',
          animation: 'fadeInUp 0.5s ease 0.3s both',
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.15) 0%, transparent 70%)', top: -100, right: -60, pointerEvents: 'none' }} />
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaPills size={24} color="white" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>For pharmacy owners</p>
            <h3 style={{ color: 'white', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Reach more patients today
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, maxWidth: 400, lineHeight: 1.6 }}>
              List your inventory, manage stock in real time, and let patients find and reserve from your pharmacy.
            </p>
          </div>
          <button
            onClick={() => navigate('/login?tab=pharmacy')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1,
              background: '#02C39A', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 12,
              cursor: 'pointer', transition: 'all var(--transition-spring)',
              boxShadow: '0 4px 14px rgba(2,195,154,0.35)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#01b08a'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#02C39A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Register your pharmacy <FiChevronRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto', textAlign: 'center', padding: '20px clamp(16px,4vw,40px)',
        fontSize: 12, color: 'var(--color-text-disabled)',
        borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)',
      }}>
        © {new Date().getFullYear()} MediFind Zimbabwe · Built to make healthcare accessible
      </footer>
    </div>
  );
}
