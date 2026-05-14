import React from 'react';
import { FiHeart, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const navigate = useNavigate();
  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #0284a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(124,58,237,0.25)' }}>
        <FiHeart size={36} color="#fff" />
      </div>
      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', background: '#e0f2fe', borderRadius: 999, padding: '4px 14px', marginBottom: 16 }}>Coming Soon</span>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 10px' }}>Your Favorites</h2>
      <p style={{ fontSize: 14, color: '#64748b', maxWidth: 280, lineHeight: 1.6, margin: '0 0 24px' }}>You haven't saved any medicines to your favorites yet.</p>
      <button style={{ background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,168,0.3)' }} onClick={() => navigate('/')}>Browse Medicines</button>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 20px 20px', marginBottom: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(5,150,105,0.25)' }}>
          <FiSettings size={32} color="#fff" />
        </div>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', background: '#e0f2fe', borderRadius: 999, padding: '4px 14px', marginBottom: 12 }}>Coming Soon</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 6px' }}>Account Settings</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>Manage your account preferences and notifications.</p>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', marginBottom: 4 }}>Preferences</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16 }}>General</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="form-group">
            <label className="form-label">Location Services</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelpPage() {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 20px 20px', marginBottom: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(217,119,6,0.25)' }}>
          <FiHelpCircle size={32} color="#fff" />
        </div>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', background: '#e0f2fe', borderRadius: 999, padding: '4px 14px', marginBottom: 12 }}>Coming Soon</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 6px' }}>Support & Help</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>Get answers to frequently asked questions.</p>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', marginBottom: 4 }}>FAQ</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16 }}>Common Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ borderLeft: '3px solid #0284a8', paddingLeft: 14 }}>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontSize: 14 }}>How do I reserve a medicine?</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Click 'Add to Cart' on any medicine and complete the checkout to reserve it for 30 minutes.</p>
          </div>
          <div style={{ borderLeft: '3px solid #02C39A', paddingLeft: 14 }}>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontSize: 14 }}>Is the stock real-time?</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Yes, we sync with pharmacy inventory systems every few minutes.</p>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284a8', marginBottom: 4 }}>Get In Touch</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>Contact Us</div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px' }}>📧 support@medifind.co.zw</p>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>📞 +263 770 000 000</p>
      </div>
    </div>
  );
}
