'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Loader2 } from 'lucide-react';
import { addLead } from '@/lib/firestore';

interface ScreeningModalProps {
  date: string;
  time: string;
  onClose: () => void;
}

export default function ScreeningModal({ date, time, onClose }: ScreeningModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('MVP');
  const [budget, setBudget] = useState('$1k–$3k');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Add lead directly for instant UI/CRM availability
      await addLead({
        name,
        email,
        projectType,
        budget,
        goals,
        stage: 'call',
        meetingDate: `${date} at ${time}`,
      });

      // Also trigger API handler non-blockingly
      fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          projectType,
          budget,
          goals,
          meetingDate: `${date} at ${time}`,
        }),
      }).catch(() => {});

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '550px', padding: '30px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!success ? (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              Confirm Consultation
            </h2>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} className="text-cyan" />
                <span>{formattedDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} className="text-cyan" />
                <span>{time}</span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Project Type</label>
                  <select
                    className="form-select"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  >
                    <option value="MVP">MVP Development</option>
                    <option value="Architecture Review">Architecture Review</option>
                    <option value="Ongoing Retainer">Ongoing Retainer</option>
                    <option value="AI Integration">AI Integration</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estimated Budget</label>
                  <select
                    className="form-select"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="<$1k">&lt;$1k</option>
                    <option value="$1k–$3k">$1k–$3k</option>
                    <option value="$3k+">$3k+</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Goals & Description</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe what you want to build or audit..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Booking...</span>
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 20px', color: 'var(--accent-emerald)' }}>
              <Calendar size={30} style={{ margin: 'auto' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
              Consultation Scheduled!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you, {name}. A calendar invitation with Google Meet details has been sent to <strong>{email}</strong>. I look forward to speaking with you on {formattedDate} at {time}.
            </p>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '150px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
