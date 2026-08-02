'use client';

import { useState } from 'react';
import { Calendar, CreditCard, Shield, User, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('Moudgalya Bandhakavi');
  const [title, setTitle] = useState('Full-Stack Developer & AI Engineer');
  const [tagline, setTagline] = useState('GDG Member & AWS Certified Cloud Practitioner');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Local profile configuration cached. (Note: Production profile uses environment variables for security.)');
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Portal Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configure integrations, calendar credentials, and your public brand tags.
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '30px' }}>
        {/* Profile Branding */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} className="text-purple" />
            <span>Profile & Branding</span>
          </h2>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Tagline Description</label>
              <input
                type="text"
                className="form-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Integration Statuses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Calendar Sync Integration */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} className="text-cyan" />
              <span>Google Calendar API</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Used to synchronize client bookings automatically, generate Google Meet links, and update your pipeline.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Google Calendar Sync Online (Mock Mode)</span>
            </div>
          </div>

          {/* Stripe Invoicing Integration */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} className="text-cyan" />
              <span>Stripe Payments</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Connected to generate checkout payment links for issued client invoices.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Stripe Invoicing Active (Developer Mode)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
