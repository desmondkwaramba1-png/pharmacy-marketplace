import { useNavigate } from 'react-router-dom';
import { FaPills, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { FiSearch, FiShoppingCart, FiClock, FiArrowRight, FiCheckCircle, FiStar } from 'react-icons/fi';
import { MdLocalPharmacy, MdVerified } from 'react-icons/md';

const NAV_LINKS = ['About Us', 'How It Works', 'FAQs', 'Contact Us'];

const FEATURES = [
  {
    icon: <FiSearch size={24} />,
    color: '#0284a8',
    bg: 'linear-gradient(135deg, #e0f4f8 0%, #b3e5f0 100%)',
    title: 'Search Any Medicine',
    desc: 'Find any medicine by name or category instantly across all registered pharmacies in Zimbabwe.',
  },
  {
    icon: <FaMapMarkerAlt size={22} />,
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
    title: 'Nearby Pharmacies',
    desc: 'See which licensed pharmacies have your medicine in stock, sorted by distance from you.',
  },
  {
    icon: <FiShoppingCart size={24} />,
    color: '#059669',
    bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    title: 'Reserve & Hold',
    desc: 'Add to cart and hold your medicines for 10 minutes while you travel to collect.',
  },
  {
    icon: <FiClock size={24} />,
    color: '#D97706',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    title: 'Skip the Queue',
    desc: 'Your order is ready when you arrive — no searching shelves, no disappointment.',
  },
];

const HOW_STEPS = [
  { num: '01', title: 'Search', desc: 'Type a medicine name and see real-time stock from pharmacies near you.' },
  { num: '02', title: 'Compare & Reserve', desc: 'Compare prices and stock, then add your medicines to cart to hold them.' },
  { num: '03', title: 'Collect', desc: 'Head to the pharmacy — your order is ready and waiting for you.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100dvh', background: '#ffffff', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 5vw, 60px)', height: 68,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #eef2f7',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #0284a8 0%, #02C39A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2,132,168,0.3)',
          }}>
            <FaPills size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.04em' }}>
            Medi<span style={{ color: '#0284a8' }}>Find</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginLeft: 3, letterSpacing: 0 }}>ZW</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="landing-nav-links">
          {NAV_LINKS.map(link => (
            <span key={link} style={{ fontSize: 14, fontWeight: 500, color: '#64748b', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0284a8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >{link}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{
              fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: 'none', color: '#374151', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0284a8'; (e.currentTarget as HTMLElement).style.color = '#0284a8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
          >Log In</button>
          <button onClick={() => navigate('/login?tab=patient')}
            style={{
              fontSize: 14, fontWeight: 700, padding: '9px 22px', borderRadius: 10,
              background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2,132,168,0.35)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(2,132,168,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(2,132,168,0.35)'; }}
          >Sign Up</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #b8eaf3 0%, #d4f5ec 50%, #e8f8f5 100%)',
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 5vw, 60px)',
        display: 'flex', alignItems: 'center', gap: 40,
        flexWrap: 'wrap', position: 'relative', overflow: 'hidden', minHeight: 440,
      }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 65%)', top: -180, left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.18) 0%, transparent 70%)', bottom: -80, right: '40%', pointerEvents: 'none' }} />

        {/* Left text */}
        <div style={{ flex: '1 1 380px', position: 'relative', zIndex: 1, animation: 'lp-fadeInUp 0.55s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(2,132,168,0.25)',
            borderRadius: 999, padding: '6px 14px', marginBottom: 24,
          }}>
            <MdVerified size={16} color="#0284a8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0284a8', letterSpacing: '0.04em' }}>MCAZ Verified Pharmacies</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 50px)', fontWeight: 800, color: '#0f172a',
            lineHeight: 1.12, letterSpacing: '-0.04em', marginBottom: 18,
          }}>
            A Secure Medicine<br />
            <span style={{ color: '#0284a8' }}>Marketplace.</span> MCAZ<br />
            Compliant Transactions.
          </h1>

          <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', color: '#475569', lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>
            MediFind is your secure, trusted, and MCAZ-compliant marketplace connecting
            patients with licensed pharmacies across Zimbabwe — in real time.
          </p>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
            {['MCAZ Compliant', 'Licensed Pharmacies Only', 'Prescription Enforced'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheckCircle size={15} color="#059669" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login?tab=patient')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: 'white', border: 'none',
                fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 12, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(2,132,168,0.35)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(2,132,168,0.45)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(2,132,168,0.35)'; }}
            >
              Find Medicine Now <FiArrowRight />
            </button>
            <button onClick={() => navigate('/login?tab=pharmacy')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'white', color: '#0284a8', border: '2px solid #0284a8',
                fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f9ff'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              Register Pharmacy <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Right — medicine photo */}
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', zIndex: 0 }} />
          <img
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=520&auto=format&fit=crop"
            alt="Medicine tablets and capsules"
            style={{
              width: 'clamp(220px, 36vw, 400px)', height: 'clamp(220px, 36vw, 400px)',
              objectFit: 'cover', borderRadius: '50%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative', zIndex: 1,
              animation: 'lp-float 4s ease-in-out infinite',
              border: '6px solid white',
            }}
          />
          {/* Floating stat cards */}
          <div style={{
            position: 'absolute', top: '8%', left: '-2%', zIndex: 2,
            background: 'white', borderRadius: 14, padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'lp-fadeInUp 0.5s ease 0.35s both',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdLocalPharmacy size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>50+</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Active Pharmacies</div>
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: '10%', right: '-6%', zIndex: 2,
            background: 'white', borderRadius: 14, padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'lp-fadeInUp 0.5s ease 0.5s both',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaShieldAlt size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>500+</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Medicines Listed</div>
            </div>
          </div>
          <div style={{
            position: 'absolute', top: '44%', right: '-10%', zIndex: 2,
            background: 'linear-gradient(135deg, #059669, #34d399)', borderRadius: 14, padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
            animation: 'lp-fadeInUp 0.5s ease 0.42s both',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>✓ In Stock</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Real-time updates</div>
          </div>
        </div>
      </section>

      {/* ── DARK STRIP ───────────────────────────────────── */}
      <section style={{
        background: '#0f172a', padding: '22px clamp(16px, 5vw, 60px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(16px, 4vw, 56px)', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Connecting patients with licensed pharmacies across Zimbabwe</span>
        <div style={{ width: 1, height: 18, background: '#334155' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaPills size={12} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Powered by <span style={{ color: '#02C39A' }}>Crestline Systems</span></span>
        </div>
        <div style={{ width: 1, height: 18, background: '#334155' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MdVerified size={15} color="#0284a8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>MCAZ Compliant Platform</span>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 7vw, 88px) clamp(16px, 5vw, 60px)', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Our Pharmacy Marketplace</p>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 14 }}>
              Discover what makes MediFind different
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Features for both patients and pharmacy owners — making healthcare accessible and efficient across Zimbabwe.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title}
                style={{
                  background: 'white', borderRadius: 18, padding: '28px 24px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  animation: `lp-fadeInUp 0.45s ease ${i * 0.08 + 0.1}s both`,
                  cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT: Photo + How it works ──────────────────── */}
      <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 340px', minHeight: 380, position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=700&auto=format&fit=crop"
            alt="Inside a pharmacy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 380 }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(2,132,168,0.75) 0%, rgba(2,195,154,0.55) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 36,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              {[1,2,3,4,5].map(s => <FiStar key={s} size={15} color="#fbbf24" />)}
              <span style={{ fontSize: 14, color: 'white', fontWeight: 600, marginLeft: 4 }}>4.9 / 5 rating</span>
            </div>
            <p style={{ color: 'white', fontSize: 18, fontWeight: 700, lineHeight: 1.4, maxWidth: 300 }}>
              "MediFind saved me 2 hours — my medicine was ready when I arrived."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 10 }}>— Patient, Harare</p>
          </div>
        </div>

        <div style={{
          flex: '1 1 340px', background: 'white',
          padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0284a8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Simple process</p>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 36 }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', animation: `lp-fadeInUp 0.4s ease ${i * 0.1 + 0.1}s both` }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: ['linear-gradient(135deg,#0284a8,#02C39A)', 'linear-gradient(135deg,#7C3AED,#a855f7)', 'linear-gradient(135deg,#D97706,#f59e0b)'][i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 15, fontWeight: 800,
                  boxShadow: ['0 4px 14px rgba(2,132,168,0.35)', '0 4px 14px rgba(124,58,237,0.35)', '0 4px 14px rgba(217,119,6,0.35)'][i],
                }}>{step.num}</div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/login?tab=patient')}
            style={{
              marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 700, padding: '13px 26px', borderRadius: 12, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(2,132,168,0.35)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >Get Started <FiArrowRight /></button>
        </div>
      </section>

      {/* ── PHARMACY OWNER CTA ─────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #014d5e 100%)',
        padding: 'clamp(48px, 7vw, 88px) clamp(16px, 5vw, 60px)',
        display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,195,154,0.12) 0%, transparent 65%)', top: -200, right: -100, pointerEvents: 'none' }} />
        <div style={{ flex: '1 1 340px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#02C39A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>For pharmacy owners</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16 }}>
            Reach more patients.<br />Manage stock smarter.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 440 }}>
            List your pharmacy, update inventory in real time, and let patients find and reserve from you.
            Full MCAZ compliance built in — license verification included.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
          {['Real-time inventory management', 'Prescription validation', 'Patient reservation system', 'MCAZ license verification'].map(feat => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(2,195,154,0.2)', border: '1px solid rgba(2,195,154,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiCheckCircle size={13} color="#02C39A" />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{feat}</span>
            </div>
          ))}
          <button onClick={() => navigate('/login?tab=pharmacy')}
            style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
              background: '#02C39A', color: 'white', border: 'none',
              fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 12, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(2,195,154,0.4)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = '#01b08a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = '#02C39A'; }}
          >Register your pharmacy <FiArrowRight /></button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer style={{
        background: '#0f172a', borderTop: '1px solid #1e293b',
        padding: 'clamp(20px, 3vw, 32px) clamp(16px, 5vw, 60px)',
        display: 'flex', flexWrap: 'wrap', gap: 16,
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0284a8, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaPills size={14} color="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>
            Medi<span style={{ color: '#0284a8' }}>Find</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#475569', marginLeft: 3 }}>ZW</span>
          </span>
        </div>
        <span style={{ fontSize: 13, color: '#475569' }}>
          © {new Date().getFullYear()} MediFind Zimbabwe · Powered by <span style={{ color: '#02C39A', fontWeight: 600 }}>Crestline Systems</span>
        </span>
        <span style={{ fontSize: 12, color: '#334155' }}>Making healthcare accessible across Zimbabwe</span>
      </footer>

      <style>{`
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes lp-fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .landing-nav-links { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}
