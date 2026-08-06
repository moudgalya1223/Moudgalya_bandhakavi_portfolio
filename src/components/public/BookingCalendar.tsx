'use client';

import { useState } from 'react';
import ScreeningModal from './ScreeningModal';
import { ExternalLink, Video, Zap, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showScreening, setShowScreening] = useState(false);

  const getNextDays = () => {
    const days = [];
    const dateObj = new Date();
    let count = 0;
    while (count < 7) {
      dateObj.setDate(dateObj.getDate() + 1);
      const day = dateObj.getDay();
      if (day !== 0 && day !== 6) {
        days.push({
          dateString: dateObj.toISOString().split('T')[0],
          label: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
        count++;
      }
    }
    return days;
  };

  const timeSlots = [
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowScreening(true);
  };

  return (
    <section className="booking-section" id="booking">
      <div className="container">
        <h2 className="section-title">Schedule a Consultation</h2>
        <p className="section-subtitle">
          Choose your preferred booking channel — book directly via Topmate for instant 1:1 sessions, or pick a custom slot on our calendar below.
        </p>

        {/* Topmate Featured Highlight Card */}
        <div className="topmate-card">
          <div className="topmate-badge">
            <Zap size={14} />
            <span>Featured 1:1 Platform</span>
          </div>

          <h3 className="topmate-title">Book Directly on Topmate.io</h3>
          <p className="topmate-desc">
            Need 1:1 mentorship, quick project discovery, code review, or tech architecture guidance? Connect with me directly on Topmate for instant slot confirmation and priority assistance.
          </p>

          <div className="topmate-features">
            <div className="topmate-feature-tag">
              <Video size={16} style={{ color: '#ff6b00' }} />
              <span>1:1 Video Call Sessions</span>
            </div>
            <div className="topmate-feature-tag">
              <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Tech Stack & Architecture Review</span>
            </div>
            <div className="topmate-feature-tag">
              <MessageSquare size={16} style={{ color: 'var(--accent-purple)' }} />
              <span>Priority DMs & Career Advice</span>
            </div>
          </div>

          <a 
            href="https://topmate.io/bandhakavi_dattamoudglya" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-topmate"
          >
            <span>Book 1:1 Call on Topmate</span>
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Or Divider */}
        <div className="or-divider">
          <span>Or Book via Direct Site Calendar</span>
        </div>

        <div className="calendar-card glass-card">
          <div className="calendar-grid">
            <div className="dates-column">
              <h3 className="column-title">1. Select Date</h3>
              <div className="dates-list">
                {getNextDays().map((day) => (
                  <button
                    key={day.dateString}
                    className={`date-btn ${selectedDate === day.dateString ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDate(day.dateString);
                      setSelectedTime('');
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="times-column">
              <h3 className="column-title">2. Select Time (GMT+5:30)</h3>
              {selectedDate ? (
                <div className="times-grid">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(selectedDate, time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="time-placeholder">Please select a date first</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showScreening && (
        <ScreeningModal
          date={selectedDate}
          time={selectedTime}
          onClose={() => setShowScreening(false)}
        />
      )}
    </section>
  );
}

