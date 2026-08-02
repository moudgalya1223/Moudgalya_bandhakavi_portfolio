'use client';

import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews = [
    {
      text: "Moudgalya helped us migrate our backend functions to AWS serverless Lambda proxies. His work immediately cut down our database query timeouts, bringing response latency from 1.2s down to under 150ms. Highly recommend him for complex cloud integration.",
      name: "Marcus Reynolds",
      role: "Lead Platform Engineer",
      company: "Apex Ledger Corp",
    },
    {
      text: "We hired Moudgalya to build a secure KYC front-end tool for Canadian client declaration flows. He executed the Angular code cleanly and aligned perfectly with our Agile sprint cycles. Great communication, extremely self-sufficient.",
      name: "Sarah Jenkins",
      role: "Director of Product Compliance",
      company: "BMO Client Portal Project Team",
    },
    {
      text: "The Vertex AI parser Moudgalya built for our receipt image parsing workflow was extremely accurate. It completely removed the need for manual inputs, logging the data directly to Firestore instantly. A true full-stack AI professional.",
      name: "David Chen",
      role: "Founder & CTO",
      company: "BlogMart Automations",
    }
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const current = reviews[activeIndex];

  return (
    <section className="testimonials-section" id="testimonials" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        <h2 className="section-title">Testimonials & Client Trust</h2>
        <p className="section-subtitle">
          Here is what other engineering leaders, startup founders, and compliant project leads say about my technical deliverables.
        </p>

        <div className="testimonials-slider">
          <div className="testimonial-card glass-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--accent-cyan)' }}>
              <Quote size={40} />
            </div>

            <p className="testimonial-text">"{current.text}"</p>

            <div className="testimonial-author">
              <div>
                <h3 className="testimonial-author-name">{current.name}</h3>
                <p className="testimonial-author-title">
                  {current.role} at <strong>{current.company}</strong>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>
                  <CheckCircle2 size={12} />
                  <span>Verified Project Client</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handlePrev}
              style={{ padding: '10px 16px', borderRadius: '50%' }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleNext}
              style={{ padding: '10px 16px', borderRadius: '50%' }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
