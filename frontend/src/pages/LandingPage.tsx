import { useNavigate } from 'react-router-dom';
import { FaPills } from 'react-icons/fa';
import { FiSearch, FiMapPin, FiShoppingCart, FiClock, FiArrowRight, FiChevronRight } from 'react-icons/fi';

const features = [
  {
    icon: <FiSearch size={22} />,
    color: '#0284a8',
    bg: '#e0f4f8',
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
    <div style={{ minHeight: '100dvh', background: '#F4F6F8', display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E8ECF0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0284a8, #016680)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2,132,168,0.25)',
          }}>
            <FaPills size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
            Medi<span style={{ color: '#0284a8' }}>Find</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none', border: '1.5px solid #E8ECF0', color: '#374151',
            fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 10,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#0284a8'; (e.target as HTMLElement).style.color = '#0284a8'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#E8ECF0'; (e.target as HTMLElement).style.color = '#374151'; }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(150deg, #012d35 0%, #014d5e 50%, #01697a 100%)',
        padding: '72px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.14) 0%, transparent 70%)', top: -180, right: -120, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,168,0.18) 0%, transparent 70%)', bottom: -120, left: -80, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600,
            padding: '6px 14px', borderRadius: 999, marginBottom: 28,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02C39A', display: 'inline-block' }} />
            Available across Zimbabwe
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.03em',
          }}>
            Find your medicine,{' '}
            <span style={{ color: '#02C39A' }}>nearby and in stock</span>
          </h1>

          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.72)',
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
                background: 'white', color: '#0284a8',
                fontSize: 15, fontWeight: 700,
                padding: '14px 28px', borderRadius: 14, border: 'none',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.18s',
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
                border: '1.5px solid rgba(255,255,255,0.3)',
                fontSize: 15, fontWeight: 600,
                padding: '14px 28px', borderRadius: 14,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            >
              Register Pharmacy <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '56px 24px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>Everything you need, in one app</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'white', border: '1.5px solid #E8ECF0',
              borderRadius: 18, padding: '22px 20px',
              transition: 'box-shadow 0.2s, transform 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: f.bg, color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pharmacy CTA */}
      <section style={{ padding: '0 24px 56px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, #012d35 0%, #01697a 100%)',
          borderRadius: 24, padding: '36px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.15) 0%, transparent 70%)', top: -100, right: -60, pointerEvents: 'none' }} />
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaPills size={22} color="white" />
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 6 }}>Pharmacy owners</p>
            <h3 style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Reach more patients today
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, maxWidth: 380 }}>
              List your inventory, manage stock in real time, and let patients find and reserve from your pharmacy.
            </p>
          </div>
          <button
            onClick={() => navigate('/login?tab=pharmacy')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#02C39A', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 12,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#01a882')}
            onMouseLeave={e => (e.currentTarget.style.background = '#02C39A')}
          >
            Register your pharmacy <FiChevronRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto', textAlign: 'center', padding: '20px 24px',
        fontSize: 12, color: '#9CA3AF',
        borderTop: '1px solid #E8ECF0', background: 'white',
      }}>
        © {new Date().getFullYear()} MediFind Zimbabwe · Built to make healthcare accessible
      </footer>
    </div>
  );
}
