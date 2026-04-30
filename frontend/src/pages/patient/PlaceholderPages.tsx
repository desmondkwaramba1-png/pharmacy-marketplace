import React from 'react';
import { FiHeart, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const navigate = useNavigate();
  return (
    <div className="page-content">
      <div className="empty-state">
        <div className="empty-state-icon"><FiHeart /></div>
        <h2 className="empty-state-title">Your Favorites</h2>
        <p className="empty-state-text">You haven't saved any medicines to your favorites yet.</p>
        <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Browse Medicines</button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="page-content">
      <h2 className="section-title">Account Settings</h2>
      <div className="info-section mt-12">
        <div className="info-section-title">General</div>
        <p className="text-secondary text-sm">Manage your account preferences and notifications.</p>
        <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      <h2 className="section-title">Support & Help</h2>
      <div className="info-section mt-12">
        <div className="info-section-title">FAQ</div>
        <div className="mt-12" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p className="font-semibold">How do I reserve a medicine?</p>
            <p className="text-sm text-secondary">Click 'Add to Cart' on any medicine and complete the checkout to reserve it for 30 minutes.</p>
          </div>
          <div>
            <p className="font-semibold">Is the stock real-time?</p>
            <p className="text-sm text-secondary">Yes, we sync with pharmacy inventory systems every few minutes.</p>
          </div>
        </div>
      </div>
      <div className="info-section mt-12">
        <div className="info-section-title">Contact Us</div>
        <p className="text-sm">Email: support@medifind.co.zw</p>
        <p className="text-sm">Phone: +263 770 000 000</p>
      </div>
    </div>
  );
}
