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

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Consultation Call: Moudgalya Bandhakavi & ${name}`);
    const details = encodeURIComponent(
      `Consultation Discovery Call\n\nClient Name: ${name}\nClient Email: ${email}\nProject Type: ${projectType}\nBudget: ${budget}\n\nGoals & Scope:\n${goals}`
    );
    const location = encodeURIComponent(`Google Meet / Video Conference`);

    // Parse date & time into approximate ISO dates for calendar event
    const startIso = new Date(`${date} ${time}`).toISOString().replace(/-|:|\.\d\d\d/g, '');
    // Default 30 min duration
    const endDateObj = new Date(new Date(`${date} ${time}`).getTime() + 30 * 60000);
    const endIso = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}&add=dattumoudgalyabandhakavi@gmail.com,${encodeURIComponent(email)}`;
  };

  const handleDownloadICS = () => {
    const startDateObj = new Date(`${date} ${time}`);
    const endDateObj = new Date(startDateObj.getTime() + 30 * 60000);
    const formatICSDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Moudgalya Bandhakavi//Consultation Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:booking-${Date.now()}@moudgalya.store`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDateObj)}`,
      `DTEND:${formatICSDate(endDateObj)}`,
      `SUMMARY:Consultation Call: Moudgalya Bandhakavi & ${name}`,
      `DESCRIPTION:Client: ${name} (${email})\\nProject Type: ${projectType}\\nBudget: ${budget}\\nGoals: ${goals}`,
      'ORGANIZER;CN=Moudgalya Bandhakavi:mailto:dattumoudgalyabandhakavi@gmail.com',
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${name}:mailto:${email}`,
      'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Moudgalya:mailto:dattumoudgalyabandhakavi@gmail.com',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-invite-${date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

      // Also trigger API handler
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
                    <option value="MVP / Full App Building">MVP / Full App Building</option>
                    <option value="Bug Fix / Troubleshooting ($50/hr)">Bug Fix / Troubleshooting ($50/hr)</option>
                    <option value="Architecture & Code Audit">Architecture & Code Audit</option>
                    <option value="Ongoing Development">Ongoing Development</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estimated Budget (USD)</label>
                  <select
                    className="form-select"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="$50/hr Bug Fix">$50/hr Bug Fix</option>
                    <option value="<$1k USD">&lt;$1k USD</option>
                    <option value="$1k–$3k USD">$1k–$3k USD</option>
                    <option value="$3k+ USD">$3k+ USD</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Goals & Description</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe what you want to build or fix..."
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
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 20px', color: 'var(--accent-emerald)' }}>
              <Calendar size={30} style={{ margin: 'auto' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
              Consultation Scheduled!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', fontSize: '0.9rem' }}>
              Thank you, <strong>{name}</strong>! Your consultation request has been submitted to <strong>dattumoudgalyabandhakavi@gmail.com</strong>. A confirmation and calendar invite have been generated for <strong>{formattedDate} at {time}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Calendar size={16} />
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={handleDownloadICS}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Download Calendar Invite (.ics)</span>
              </button>
            </div>

            <button className="btn btn-secondary" onClick={onClose} style={{ width: '150px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
