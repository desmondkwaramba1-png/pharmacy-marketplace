import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/auth';
import type { Pharmacy } from '../../types';
import { FiSave, FiClock, FiMapPin } from 'react-icons/fi';
import { FaClinicMedical, FaCheckCircle } from 'react-icons/fa';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS: Record<string, string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };

export default function ProfilePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Pharmacy>>({});
  const [hours, setHours] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data: pharmacy, isLoading } = useQuery({
    queryKey: ['admin-pharmacy'],
    queryFn: adminApi.getPharmacy,
  });

  useEffect(() => {
    if (pharmacy) {
      setForm({
        name: pharmacy.name,
        address: pharmacy.address,
        suburb: pharmacy.suburb ?? '',
        city: pharmacy.city,
        phone: pharmacy.phone ?? '',
        email: pharmacy.email ?? '',
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
      });
      if (pharmacy.operatingHours) {
        setHours(pharmacy.operatingHours as Record<string, string>);
      } else {
        const defaultHours: Record<string, string> = {};
        DAYS.forEach((d) => { defaultHours[d] = d === 'sun' ? 'Closed' : '08:00-18:00'; });
        setHours(defaultHours);
      }
    }
  }, [pharmacy]);

  const mutation = useMutation({
    mutationFn: (payload: any) => adminApi.updatePharmacy(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pharmacy'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    mutation.mutate({ ...form, operatingHours: hours });
  };

  const setHour = (day: string, value: string) =>
    setHours((prev) => ({ ...prev, [day]: value }));

  if (isLoading) {
    return (
      <div className="page">
        <header className="app-header"><h1 className="app-header-title">Pharmacy Profile</h1></header>
        <div className="empty-state">
          <div className="empty-state-icon"><FaClinicMedical /></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <h1 className="app-header-title">Pharmacy Profile</h1>
        <button
          id="save-profile-btn"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={mutation.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {mutation.isPending ? 'Saving...' : saved ? <><FaCheckCircle /> Saved</> : <><FiSave /> Save</>}
        </button>
      </header>

      <div className="page-content">
        {/* Logo */}
        <div className="profile-logo-upload">
          <div className="profile-logo-circle"><FaClinicMedical /></div>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Pharmacy Logo</span>
        </div>

        {/* Basic info */}
        <div className="info-section">
          <div className="info-section-title">Basic Information</div>
          <div className="profile-form">
            <div className="form-group">
              <label className="form-label required">Pharmacy Name</label>
              <input className="form-input" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="Pharmacy name" />
            </div>
            <div className="form-group">
              <label className="form-label required">Address</label>
              <input className="form-input" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Street address" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="form-group">
                <label className="form-label">Suburb</label>
                <input className="form-input" value={form.suburb ?? ''} onChange={(e) => set('suburb', e.target.value)} placeholder="Avondale" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-input form-select" value={form.city ?? 'Harare'} onChange={(e) => set('city', e.target.value)}>
                  {['Harare','Bulawayo','Mutare','Gweru','Kwekwe','Masvingo','Chinhoyi','Victoria Falls'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+263 4 123456" type="tel" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="pharmacy@example.co.zw" type="email" />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="info-section" style={{ marginTop: 12 }}>
          <div className="info-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiMapPin /> Location Coordinates</div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
            Enter your exact GPS coordinates so patients can find you on the map.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                className="form-input"
                type="number"
                step="0.0001"
                value={form.latitude ?? ''}
                onChange={(e) => set('latitude', parseFloat(e.target.value))}
                placeholder="-17.8292"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                className="form-input"
                type="number"
                step="0.0001"
                value={form.longitude ?? ''}
                onChange={(e) => set('longitude', parseFloat(e.target.value))}
                placeholder="31.0522"
              />
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 6 }}>
            💡 Tip: Find your coordinates at maps.google.com → right-click your location
          </p>
        </div>

        {/* Operating hours */}
        <div className="info-section" style={{ marginTop: 12 }}>
          <div className="info-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiClock /> Operating Hours</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAYS.map((day) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{DAY_LABELS[day]}</span>
                {hours[day] === 'Closed' ? (
                  <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                    <span className="badge badge-error">Closed</span>
                    <button
                      className="btn-ghost btn"
                      style={{ fontSize: 12, height: 28 }}
                      onClick={() => setHour(day, '08:00-18:00')}
                    >Open</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      value={hours[day] ?? '08:00-18:00'}
                      onChange={(e) => setHour(day, e.target.value)}
                      style={{ height: 36, flex: 1 }}
                      placeholder="08:00-18:00"
                    />
                    <button
                      className="btn-ghost btn"
                      style={{ fontSize: 12, height: 28, color: 'var(--color-error)' }}
                      onClick={() => setHour(day, 'Closed')}
                    >Closed</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : saved ? <><FaCheckCircle /> Changes Saved!</> : <><FiSave /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
