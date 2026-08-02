'use client';

import { useState } from 'react';
import ScreeningModal from './ScreeningModal';

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
          Select an available slot for a 30-minute discovery call to discuss your project goals, stack modernization, or architecture reviews.
        </p>

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
